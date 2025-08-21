
import {MapG} from "@e280/stz"

import {Hub} from "./parts/hub.js"
import {Seat} from "./parts/seat.js"
import {MetaApi} from "./meta/types.js"
import {HostOn} from "./parts/host-on.js"
import {Liaison} from "../core/liaison.js"
import {FiberRpc} from "./parts/fiber-rpc.js"
import {Authority} from "../core/authority.js"
import {Simulator} from "../core/simulator.js"
import {makeMetaHostApi} from "./meta/meta-host.js"
import {AuthorId, InferSimulatorSchema, Telegram} from "../core/types.js"

export class SessionHost<xSimulator extends Simulator> {
	authority: Authority<InferSimulatorSchema<xSimulator>>
	seats = new MapG<AuthorId, Seat>()
	on = new HostOn()

	#cleanup = () => {}

	constructor(
			public hub: Hub,
			public simulator: xSimulator,
		) {

		const authority = new Authority(simulator)
		this.authority = authority

		this.#cleanup = hub.onSpoke(spoke => {
			const authorId = authority.idCounter.next()

			const liaison = new Liaison<Telegram<any>>(authorId, spoke.fibers.sub.primary)
			authority.liaisons.add(liaison)
			liaison.send(authority.getStateTelegram())

			new FiberRpc<MetaApi["host"]>(
				spoke.fibers.sub.meta,
				makeMetaHostApi({authority, liaison}),
			).remote as MetaApi["client"]

			const seat = new Seat(spoke, liaison)
			this.seats.set(authorId, seat)
			this.on.seated.pub(seat)

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
		this.on.unseated.pub(seat)
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

