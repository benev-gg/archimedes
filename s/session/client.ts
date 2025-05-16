
import {endpoint} from "renraku"

import {Seat} from "./parts/seat.js"
import {Spoke} from "./parts/spoke.js"
import {MetaApi} from "./meta/types.js"
import {Liaison} from "../core/liaison.js"
import {FiberRpc} from "./parts/fiber-rpc.js"
import {Simulator} from "../core/simulator.js"
import {Speculator} from "../core/speculator.js"
import {makeMetaClientApi} from "./meta/meta-client.js"
import {InferSimulatorSchema, Telegram} from "../core/types.js"

export class SessionClient<xSimulator extends Simulator<any>> {
	static async make<xSimulator extends Simulator<any>>(options: {
			hz: number
			spoke: Spoke
			pastSimulator: xSimulator
			futureSimulator: xSimulator
		}) {

		const meta = new FiberRpc<MetaApi["host"]>(
			options.spoke.fibers.sub.meta,
			endpoint(makeMetaClientApi()),
		).remote as MetaApi["host"]

		const {hostAuthorId, clientAuthorId} = await meta.hello()
		const liaison = new Liaison<Telegram<any>>(hostAuthorId, options.spoke.fibers.sub.primary)
		const seat = new Seat(options.spoke, liaison)

		const speculator = new Speculator(
			clientAuthorId,
			liaison,
			options.pastSimulator,
			options.futureSimulator,
			options.hz,
		)

		return new this(seat, speculator)
	}

	constructor(
		public seat: Seat,
		public speculator: Speculator<InferSimulatorSchema<xSimulator>>,
	) {}

	disconnect() {
		this.seat.disconnect()
	}
}

