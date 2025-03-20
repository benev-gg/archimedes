
import {Map2} from "@benev/slate"

import {Hub} from "./parts/hub.js"
import {Seat} from "./parts/seat.js"
import {HostOn} from "./parts/host-on.js"
import {Liaison} from "../core/liaison.js"
import {Authority} from "../core/authority.js"
import {Simulator} from "../core/simulator.js"
import {AuthorId, InferSimulatorSchema, Telegram} from "../core/types.js"

export class SessionHost<xSimulator extends Simulator<any>> {
	authority: Authority<InferSimulatorSchema<xSimulator>>
	seats = new Map2<AuthorId, Seat>()
	on = new HostOn()

	#cleanup = () => {}

	constructor(options: {
			hub: Hub
			simulator: xSimulator,
		}) {

		const authority = new Authority(options.simulator)
		this.authority = authority

		this.#cleanup = options.hub.onSpoke(spoke => {
			const authorId = authority.idCounter.next()
			console.log(`client connected: ${authorId}`)

			const liaison = new Liaison<Telegram<any>>(authorId, spoke.fibers.sub.primary)
			authority.liaisons.add(liaison)
			liaison.send(authority.getStateTelegram())

			const seat = new Seat(spoke, liaison)
			this.seats.set(authorId, seat)
			this.on.seated.publish(seat)

			return () => {
				authority.liaisons.delete(liaison)
				this.#unseat(authorId)
			}
		})
	}

	#unseat(authorId: AuthorId) {
		const seat = this.seats.get(authorId)
		if (!seat) return undefined
		seat.disconnect()
		this.seats.delete(authorId)
		this.on.unseated.publish(seat)
	}

	disconnectAll() {
		for (const authorId of this.seats.keys())
			this.#unseat(authorId)
	}

	dispose() {
		this.#cleanup()
		this.disconnectAll()
	}
}

