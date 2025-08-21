
import {coalesce} from "@e280/stz"
import {StdCable} from "sparrow-rtc"

import {json} from "./codecs.js"
import {Codec} from "./types.js"
import {u8} from "../../tools/u8.js"
import {Contact} from "./contact.js"
import {onChannelMessage} from "../utils/on-channel-message.js"

/**
* Bob sends whatever alice sends. (alice.send->bob.send)
*
* Bob is forwarding alice's outgoing mail.
*
*     ALICE             BOB
*     -----             ---
*     [send] --------> [send]
*
*     [recv]           [recv]
*/
export function send<O>(alice: Contact<any, O>, ...bobs: Contact<any, O>[]) {
	return alice.send.on((output, reliable) => {
		for (const bob of bobs)
			bob.send(output, reliable)
	})
}

/**
* Bob receives whatever alice receives. (alice.recv->bob.recv)
*
* Bob is CC'd on alice's incoming mail.
*
*     ALICE             BOB
*     -----             ---
*     [send]           [send]
*
*     [recv] --------> [recv]
*/
export function recv<I>(alice: Contact<I, any>, ...bobs: Contact<I, any>[]) {
	return alice.recv.on((input, reliable) => {
		for (const bob of bobs)
			bob.recv(input, reliable)
	})
}

/**
* Bob sends and receives what alice sends and receives. (alice.send->bob.send + alice.recv->bob.recv)
*
* Bob is alice's trusted mail confidant. He forwards her outgoing mail, and he's even CC'd on her incoming mail.
*
*     ALICE             BOB
*     -----             ---
*     [send] --------> [send]
*
*     [recv] --------> [recv]
*/
export function mirror<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
	return coalesce(
		send(alice, ...bobs),
		recv(alice, ...bobs),
	)
}

/**
* Bob sends what alice sends, alice receives what bob receives. (alice.send->bob.send + bob.recv->alice.recv)
*
* Bob is alice's local post office. He forwards her incoming and outgoing mail.
*
*     ALICE             BOB
*     -----             ---
*     [send] --------> [send]
*
*     [recv] <-------- [recv]
*/
export function relay<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
	return coalesce(
		send(alice, ...bobs),
		...bobs.map(bob => recv(bob, alice))
	)
}

/**
* Bob receives whatever alice sends. (alice.send->bob.recv)
*
* Bob is the recipient of alice's love letters.
*
*     ALICE             BOB
*     -----             ---
*     [send] ---\      [send]
*                \
*     [recv]      \--> [recv]
*/
export function delivery<O>(alice: Contact<any, O>, ...bobs: Contact<O, any>[]) {
	return alice.send.on((data, reliable) => {
		for (const bob of bobs)
			bob.recv(data, reliable)
	})
}

/**
* Bob sends whatever alice receives. (alice.recv->bob.send)
*
* Bob is a federal agent illegally snooping on alice's incoming mail, and sending copies back to headquarters without a warrant.
*
*     ALICE             BOB
*     -----             ---
*     [send]      /--> [send]
*                /
*     [recv] ---/      [recv]
*/
export function spy<I>(alice: Contact<I, any>, ...bobs: Contact<any, I>[]) {
	return alice.recv.on((data, reliable) => {
		for (const bob of bobs)
			bob.send(data, reliable)
	})
}

/**
* Alice and bob both receive what the other sends.
*
* Bob and alice are in love, and are sending each other letters.
*
*     ALICE             BOB
*     -----             ---
*     [send] ---\ /--- [send]
*                X
*     [recv] <--/ \--> [recv]
*/
export function exchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
	return coalesce(
		delivery(alice, ...bobs),
		...bobs.map(bob => delivery(bob, alice))
	)
}

/**
* Alice and bob both send what the other receives.
*
* Bob and alice are having a divorce, and they are both snooping on each other's mail, and sending copies to their lawyers.
*
*     ALICE             BOB
*     -----             ---
*     [send] <--\ /--> [send]
*                X
*     [recv] ---/ \--- [recv]
*/
export function spyExchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
	return coalesce(
		spy(alice, ...bobs),
		...bobs.map(bob => spy(bob, alice))
	)
}

/**
* Bob becomes a relay for alice, but bob sends and receives bytes.
*
*     ALICE             BOB
*     -----             ---
*     [send] --------> [send(bytes)]
*
*     [recv] <-------- [recv(bytes)]
*/
export function relayBinary(alice: Contact, bob: Contact<Uint8Array>, codec: Codec = json) {
	return coalesce(
		alice.send.on((output, reliable) => bob.send(codec.encode(output), reliable)),
		bob.recv.on((input, reliable) => alice.recv(codec.decode(input), reliable)),
	)
}

/**
* Cable becomes a relay for alice.
*
*     ALICE            CABLE
*     -----            -----
*     [send] --------> [send]
*
*     [recv] <-------- [recv]
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

