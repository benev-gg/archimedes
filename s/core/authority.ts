
import {Liaison} from "./liaison.js"
import {Simulator} from "./simulator.js"
import {Ticker} from "../tools/ticker.js"
import {IdCounter} from "../tools/id-counter.js"
import {isInputDispatch} from "./utils/is-input-dispatch.js"
import {DeltaDispatch, InputDispatch, Schema, StateDispatch, Telegram} from "./types.js"

export class Authority<xSchema extends Schema> {
	idCounter = new IdCounter()
	liaisons = new Set<Liaison<Telegram<xSchema>>>()
	authorId = this.idCounter.next()
	currentTick = 0

	constructor(public simulator: Simulator<xSchema>) {}

	tick() {
		const tick = ++this.currentTick
		const inputDispatches = this.#collectInputDispatches()
		const delta = this.simulator.simulate([tick, inputDispatches])
		const deltaDispatch: DeltaDispatch<xSchema> = ["delta", delta]

		const broadcast: Telegram<xSchema> = [
			tick,
			[...inputDispatches, deltaDispatch],
		]

		for (const liaison of this.liaisons) {
			const tailored = this.simulator.tailor(liaison.authorId, broadcast)
			liaison.queue(tailored)
		}
	}

	makeTicker(hz: number) {
		return new Ticker(hz, () => this.tick())
	}

	getStateTelegram(): Telegram<xSchema> {
		const dispatch: StateDispatch<xSchema> = ["state", this.simulator.state]
		return [this.authorId, [dispatch]]
	}

	#collectInputDispatches() {
		const dispatches: InputDispatch<xSchema>[] = []

		for (const liaison of this.liaisons)
			liaison.recv()
				.map(([_, dispatches]) => ["input", [

					// overwrite author id to prevent spoofing
					liaison.authorId,

					// filter for inputs
					dispatches.filter(isInputDispatch),

				]] as InputDispatch<xSchema>)
				.forEach(t => dispatches.push(t))

		return dispatches
	}
}

