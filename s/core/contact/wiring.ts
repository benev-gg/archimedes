
import {coalesce} from "@e280/stz"
import {StdCable} from "sparrow-rtc"

import {json} from "./codecs.js"
import {Codec} from "./types.js"
import {u8} from "../../tools/u8.js"
import {Contact} from "./contact.js"
import {onChannelMessage} from "../utils/on-channel-message.js"

/**
* bob sends whatever alice sends. (alice.send->bob.send)
*
* bob is forwarding alice's outgoing mail.
*
* ```
* alice             bob
* -----             ---
* [send] --------> [send]
*
* [recv]           [recv]
* ```
*/
export function send<O>(alice: Contact<any, O>, ...bobs: Contact<any, O>[]) {
	return alice.send.on((output, reliable) => {
		for (const bob of bobs)
			bob.send(output, reliable)
	})
}

/**
* bob receives whatever alice receives. (alice.recv->bob.recv)
*
* bob is cc'd on alice's incoming mail.
*
* ```
* alice             bob
* -----             ---
* [send]           [send]
*
* [recv] --------> [recv]
* ```
*/
export function recv<I>(alice: Contact<I, any>, ...bobs: Contact<I, any>[]) {
	return alice.recv.on((input, reliable) => {
		for (const bob of bobs)
			bob.recv(input, reliable)
	})
}

/**
* bob sends and receives what alice sends and receives. (alice.send->bob.send + alice.recv->bob.recv)
*
* bob is alice's trusted mail confidant. he forwards her outgoing mail, and he's even cc'd on her incoming mail.
*
* ```
* alice             bob
* -----             ---
* [send] --------> [send]
*
* [recv] --------> [recv]
* ```
*/
export function mirror<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
	return coalesce(
		send(alice, ...bobs),
		recv(alice, ...bobs),
	)
}

/**
* bob sends what alice sends, alice receives what bob receives. (alice.send->bob.send + bob.recv->alice.recv)
*
* bob is alice's local post office. he forwards her incoming and outgoing mail.
*
* ```
* alice             bob
* -----             ---
* [send] --------> [send]
*
* [recv] <-------- [recv]
* ```
*/
export function relay<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
	return coalesce(
		send(alice, ...bobs),
		...bobs.map(bob => recv(bob, alice))
	)
}

/**
* bob receives whatever alice sends. (alice.send->bob.recv)
*
* bob is the recipient of alice's love letters.
*
* ```
* alice             bob
* -----             ---
* [send] ---\      [send]
*            \
* [recv]      \--> [recv]
* ```
*/
export function delivery<O>(alice: Contact<any, O>, ...bobs: Contact<O, any>[]) {
	return alice.send.on((data, reliable) => {
		for (const bob of bobs)
			bob.recv(data, reliable)
	})
}

/**
* bob sends whatever alice receives. (alice.recv->bob.send)
*
* bob is a federal agent illegally snooping on alice's incoming mail, and sending copies back to headquarters without a warrant.
*
* ```
* alice             bob
* -----             ---
* [send]      /--> [send]
*            /
* [recv] ---/      [recv]
* ```
*/
export function spy<I>(alice: Contact<I, any>, ...bobs: Contact<any, I>[]) {
	return alice.recv.on((data, reliable) => {
		for (const bob of bobs)
			bob.send(data, reliable)
	})
}

/**
* alice and bob both receive what the other sends.
*
* bob and alice are in love, and are sending each other letters.
*
* ```
* alice             bob
* -----             ---
* [send] ---\ /--- [send]
*            x
* [recv] <--/ \--> [recv]
* ```
*/
export function exchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
	return coalesce(
		delivery(alice, ...bobs),
		...bobs.map(bob => delivery(bob, alice))
	)
}

/**
* alice and bob both send what the other receives.
*
* bob and alice are having a divorce, and they are both snooping on each other's mail, and sending copies to their lawyers.
*
* ```
* alice             bob
* -----             ---
* [send] <--\ /--> [send]
*            x
* [recv] ---/ \--- [recv]
* ```
*/
export function spyExchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
	return coalesce(
		spy(alice, ...bobs),
		...bobs.map(bob => spy(bob, alice))
	)
}

/**
* bob becomes a relay for alice, but bob sends and receives bytes.
*
* ```
* alice             bob
* -----             ---
* [send] --------> [send(bytes)]
*
* [recv] <-------- [recv(bytes)]
* ```
*/
export function relayBinary(alice: Contact, bob: Contact<Uint8Array>, codec: Codec = json) {
	return coalesce(
		alice.send.on((output, reliable) => bob.send(codec.encode(output), reliable)),
		bob.recv.on((input, reliable) => alice.recv(codec.decode(input), reliable)),
	)
}

/**
* cable becomes a relay for alice.
*
* ```
* alice            cable
* -----            -----
* [send] --------> [send]
*
* [recv] <-------- [recv]
* ```
*/
export function relayCable(alice: Contact, cable: StdCable, codec: Codec = json) {
	const bob = new Contact<Uint8Array>()
	return coalesce(
		relayBinary(alice, bob, codec),
		bob.send.on((output, reliable) => {
			if (reliable) cable.reliable.send(u8(output))
			else cable.unreliable.send(u8(output))
		}),
		onChannelMessage(cable.reliable, input => bob.recv(input, true)),
		onChannelMessage(cable.unreliable, input => bob.recv(input, false)),
	)
}

