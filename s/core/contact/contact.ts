
import {pub} from "@e280/stz"
import {StdCable} from "sparrow-rtc"
import {ContactInput} from "./types.js"
import {Codec, codecs} from "./codecs.js"
import {disposers} from "../../tools/disposers.js"
import {onChannelMessage} from "../utils/on-channel-message.js"

export class Contact<I = any, O = I> {
	static codecs = codecs

	send = pub<[output: O, reliable: boolean]>()
	recv = pub<[input: I, reliable: boolean]>()

	/** Create a new exchanging partner contact */
	counterpart() {
		const bob = new Contact<O, I>()
		const detach = Contact.exchanging(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** Create a new extending partner contact */
	extend() {
		const bob = new Contact<I, O>()
		const detach = Contact.extending(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** Create a new extending partner contact that speaks binary */
	extendCodec(codec: Codec = codecs.msgpack) {
		const bob = new Contact<Uint8Array>()
		const detach = disposers(
			this.send.on((data, reliable) => bob.recv(codec.encode(data), reliable)),
			bob.recv.on((data, reliable) => this.recv(codec.decode(data), reliable)),
		)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/**
	 * Bob sends whatever alice sends.
	 *
	 *     ALICE             BOB
	 *     -----             ---
	 *     [send] --------> [send]
	 *
	 *     [recv]           [recv]
	 */
	static relaying<O>(alice: Contact<any, O>, ...bobs: Contact<any, O>[]) {
		return alice.send.on((data, reliable) => {
			for (const bob of bobs)
				bob.send(data, reliable)
		})
	}

	/**
	 * Bob receives whatever alice sends.
	 *
	 *     ALICE             BOB
	 *     -----             ---
	 *     [send] ---\      [send]
	 *                \
	 *     [recv]      \--> [recv]
	 */
	static receiving<O>(alice: Contact<any, O>, ...bobs: Contact<O, any>[]) {
		return alice.send.on((data, reliable) => {
			for (const bob of bobs)
				bob.recv(data, reliable)
		})
	}

	/**
	 * Wire alice and bob together so each receives what the other sends.
	 *
	 *     ALICE             BOB
	 *     -----             ---
	 *     [send] ---\ /--- [send]
	 *                X
	 *     [recv] <--/ \--> [recv]
	 */
	static exchanging<I, O = I>(alice: Contact<I, O>, bob: Contact<O, I>) {
		return disposers(
			this.receiving(alice, bob),
			this.receiving(bob, alice),
		)
	}

	/**
	 * Bob becomes an extension of alice.
	 *
	 *     ALICE             BOB
	 *     -----             ---
	 *     [send] --------> [send]
	 *
	 *     [recv] <-------- [recv]
	 */
	static extending<I, O = I>(alice: Contact<I, O>, bob: Contact<I, O>) {
		return disposers(
			this.relaying(alice, bob),
			this.relaying(bob, alice),
		)
	}

	/**
	 * Cable becomes an extension of alice.
	 *
	 *     ALICE             BOB
	 *     -----             ---
	 *     [send] --------> [send]
	 *
	 *     [recv] <-------- [recv]
	 */
	static extendingCable(
			alice: Contact,
			cable: StdCable,
			codec: Codec = codecs.msgpack,
		) {
		return disposers(
			alice.send.on((output, reliable) => {
				if (reliable) cable.reliable.send(new Uint8Array(codec.encode(output)))
				else cable.unreliable.send(new Uint8Array(codec.encode(output)))
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

