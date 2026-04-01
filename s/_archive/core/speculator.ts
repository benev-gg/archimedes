
import {Liaison} from "./liaison.js"
import {loop} from "../tools/loop.js"
import {Simulator} from "./simulator.js"
import {Chronicle} from "../tools/chronicle.js"
import {AuthorId, Schema, Telegram} from "./types.js"
import {makeTelegramForInputs} from "./utils/make-telegram-for-inputs.js"

export class Speculator<xSchema extends Schema> {
	#currentTick = 0
	#chronicle = new Chronicle<xSchema["input"]>()

	maxIncomingTicks = 5

	constructor(
		public authorId: AuthorId,
		public liaison: Liaison<Telegram<xSchema>>,
		public pastSimulator: Simulator<xSchema>,
		public futureSimulator: Simulator<xSchema>,
		public hz: number,
	) {}

	get ticksAhead() {
		const rtt = this.liaison.pingponger.averageRtt
		return Math.round(rtt / (1000 / this.hz))
	}

	tick() {
		const telegrams = this.liaison.recv().slice(-this.maxIncomingTicks)
		const lastTelegram = telegrams.at(-1)

		for (const telegram of telegrams)
			this.pastSimulator.simulate(telegram)

		if (lastTelegram) {
			const [latestTick] = lastTelegram
			this.#currentTick = latestTick
		}
		else this.#currentTick += 1

		// roll-forward
		this.futureSimulator.state = structuredClone(this.pastSimulator.state)

		for (const t of loop(this.ticksAhead)) {
			for (const inputs of this.#chronicle.at(t)) {
				this.futureSimulator.simulate(
					makeTelegramForInputs(t, this.authorId, inputs)
				)
			}
		}
	}

	sendInputs(inputs: xSchema["input"][]) {
		const futureTick = this.#currentTick + this.ticksAhead

		// immediately send down the wire
		this.liaison.send(makeTelegramForInputs(futureTick, this.authorId, inputs))

		// schedule local inputs into the future
		this.#chronicle.add(inputs, futureTick)
	}
}

