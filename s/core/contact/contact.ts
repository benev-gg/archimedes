
import {StdCable} from "sparrow-rtc"
import {coalesce, pub} from "@e280/stz"
import {json} from "./codecs/codecs.js"
import {Codec} from "./codecs/types.js"
import {ContactInput} from "./types.js"
import {onChannelMessage} from "../utils/on-channel-message.js"
import { u8 } from "../../tools/u8.js"

export class Contact<I = any, O = I> {
	send = pub<[output: O, reliable: boolean]>()
	recv = pub<[input: I, reliable: boolean]>()

	/** Create a new exchanging partner contact */
	counterpart() {
		const bob = new Contact<O, I>()
		const detach = Contact.wireExchange(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** Create a new extending partner contact */
	extend() {
		const bob = new Contact<I, O>()
		const detach = Contact.wireMirror(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** Create a new extending partner contact that speaks binary */
	binary(codec: Codec = json) {
		const bob = new Contact<Uint8Array>()
		const detach = coalesce(
			this.send.on((data, reliable) => bob.recv(codec.encode(data), reliable)),
			bob.recv.on((data, reliable) => this.recv(codec.decode(data), reliable)),
		)
		return [bob, detach] as [typeof bob, typeof detach]
	}

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
	static wireSend<O>(alice: Contact<any, O>, ...bobs: Contact<any, O>[]) {
		return alice.send.on((data, reliable) => {
			for (const bob of bobs)
				bob.send(data, reliable)
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
	static wireRecv<I>(alice: Contact<I, any>, ...bobs: Contact<I, any>[]) {
		return alice.recv.on((data, reliable) => {
			for (const bob of bobs)
				bob.recv(data, reliable)
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
	static wireMirror<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
		return coalesce(
			this.wireSend(alice, ...bobs),
			this.wireRecv(alice, ...bobs),
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
	static wireRelay<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<I, O>[]) {
		return coalesce(
			this.wireSend(alice, ...bobs),
			...bobs.map(bob => this.wireRecv(bob, alice))
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
	static wireDelivery<O>(alice: Contact<any, O>, ...bobs: Contact<O, any>[]) {
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
	static wireSpy<I>(alice: Contact<I, any>, ...bobs: Contact<any, I>[]) {
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
	static wireExchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
		return coalesce(
			this.wireDelivery(alice, ...bobs),
			...bobs.map(bob => this.wireDelivery(bob, alice))
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
	static wireSpyExchange<I, O = I>(alice: Contact<I, O>, ...bobs: Contact<O, I>[]) {
		return coalesce(
			this.wireSpy(alice, ...bobs),
			...bobs.map(bob => this.wireSpy(bob, alice))
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
	static wireCable(
			alice: Contact,
			cable: StdCable,
			codec: Codec = json,
		) {
		return coalesce(
			alice.send.on((output, reliable) => {
				if (reliable) cable.reliable.send(u8(codec.encode(output)))
				else cable.unreliable.send(u8(codec.encode(output)))
			}),
			onChannelMessage(cable.reliable, input => alice.recv(codec.decode(input), true)),
			onChannelMessage(cable.unreliable, input => alice.recv(codec.decode(input), false)),
		)
	}

	/** roll multiple sub-contacts into a single mega-contact */
	static multiplex<Sc extends {[key: string]: Contact}>(subcontacts: Sc) {
		type Submessages = {[K in keyof Sc]: [K, ContactInput<Sc[K]>]}
		type Submessage = Submessages[keyof Sc]
		const megacontact = new Contact<Submessage>()

		for (const [key, subcontact] of Object.entries(subcontacts))
			subcontact.send.on((x, reliable) => megacontact.send([key, x], reliable))

		megacontact.recv.on(([key, data], reliable) => {
			const subcontact = subcontacts[key as any]
			if (!subcontact) throw new Error(`unknown subcontact "${key as any}"`)
			subcontact.recv(data as any, reliable)
		})

		return megacontact
	}
}

