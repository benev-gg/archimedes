
import {Liaison} from "./liaison.js"
import {loop} from "../tools/loop.js"
import {Simulator} from "./simulator.js"
import {Chronicle} from "../tools/chronicle.js"
import {AuthorId, InputDispatch, InputTelegram, Schema, Telegram} from "./types.js"

export class Speculator<xSchema extends Schema> {
	#currentTick = 0
	#chronicle = new Chronicle<InputTelegram<xSchema>>()

	constructor(
		public authorId: AuthorId,
		public liaison: Liaison<Telegram<xSchema>[]>,
		public pastSimulator: Simulator<xSchema>,
		public futureSimulator: Simulator<xSchema>,
		public hz: number,
	) {}

	get ticksAhead() {
		const rtt = this.liaison.pingponger.averageRtt
		return Math.round(rtt / (1000 / this.hz))
	}

	tick() {
		this.#currentTick += 1

		const telegrams = this.liaison.recv().flat()
		this.pastSimulator.simulate(telegrams)

		// roll-forward
		this.futureSimulator.state = structuredClone(this.pastSimulator.state)
		for (const t of loop(this.ticksAhead)) {
			const scheduledTelegrams = this.#chronicle.at(t)
			this.futureSimulator.simulate(scheduledTelegrams)
		}
	}

	sendInputs(inputs: xSchema["input"][]) {
		const dispatches: InputDispatch<xSchema>[] = inputs.map(input => ["input", input])
		const telegram: InputTelegram<xSchema> = [this.authorId, dispatches]

		// immediately send down the wire
		this.liaison.send([telegram])

		// schedule local inputs into the future
		const futureTick = this.#currentTick + this.ticksAhead
		this.#chronicle.add(telegram, futureTick)
	}
}

