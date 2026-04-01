
import {pub} from "@e280/stz"
import {StdCable} from "sparrow-rtc"

import {json} from "./codecs.js"
import {ContactInput, Codec} from "./types.js"
import {exchange, mirror, relayCable} from "./wiring.js"

export class Contact<I = any, O = I> {
	send = pub<[output: O, reliable: boolean]>()
	recv = pub<[input: I, reliable: boolean]>()

	/** clear all send and recv listeners */
	dispose() {
		this.send.clear()
		this.recv.clear()
	}

	/** create a new contact that is an exchange partner (see wiring.exchange) */
	exchange() {
		const bob = new Contact<O, I>()
		const detach = exchange(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** create a new contact that is a mirror (see wiring.mirror) */
	mirror() {
		const bob = new Contact<I, O>()
		const detach = mirror(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** create a new contact that is a relay (see wiring.relay) */
	relay() {
		const bob = new Contact<I, O>()
		const detach = mirror(this, bob)
		return [bob, detach] as [typeof bob, typeof detach]
	}

	/** attach an rtc cable to this contact as a relay */
	relayCable(cable: StdCable, codec: Codec = json) {
		return relayCable(this, cable, codec)
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

