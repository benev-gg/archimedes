
import {World} from "../parts/world.js"
import {EurekaSchema} from "./types.js"
import {EurekaContext} from "./context.js"
import {Components, EntityId} from "../parts/types.js"
import {Simulator} from "../../core/simulator.js"
import {AuthorId, Dispatch, Telegram} from "../../core/types.js"

export class EurekaSimulator
	<xContext extends EurekaContext, C extends Components>
	extends Simulator<EurekaSchema<C>> {

	#deltas: EurekaSchema<C>["delta"] = []
	#authorityId = 0

	constructor(public world: World<xContext, C>) {
		super([...world.data()])
		world.on((id, entity) => void this.#deltas.push([id, entity?.components ?? null]))
	}

	simulate(telegram: Telegram<EurekaSchema<C>>): EurekaSchema<C>["delta"] {
		this.#deltas = []

		Simulator.handleTelegram(telegram, {
			input: (inputs) => {
				this.world.context.inputs.add(inputs)
			},

			state: (state, authorId) => {
				if (authorId === this.#authorityId) {
					this.world.clear()
					this.world.overwrite(state)
				}
			},

			delta: (deltas, authorId) => {
				if (authorId === this.#authorityId)
					return undefined
				for (const [id, components] of deltas)
					this.world.write(id, components)
			},
		})

		this.world.execute()
		return this.#deltas
	}

	tailor(audienceAuthorId: AuthorId, telegram: Telegram<EurekaSchema<C>>): Telegram<EurekaSchema<C>> {
		const check = (eid: EntityId) => this.world.context.relevance.check(audienceAuthorId, eid)
		const [telegramAuthorId, dispatches] = telegram
		const relevantDispatches: Dispatch<EurekaSchema<C>>[] = []
		for (const [kind, x] of dispatches) {
			switch (kind) {

				case "state": {
					relevantDispatches.push([kind, x.filter(([id]) => check(id))])
				} break

				case "delta": {
					relevantDispatches.push([kind, x.filter(([id]) => check(id))])
				} break

				case "input": {
					const [authorId, inputEntries] = x
					relevantDispatches.push([
						kind,
						[authorId, inputEntries.filter(([id]) => check(id))],
					])
				} break
			}
		}
		return [telegramAuthorId, relevantDispatches]
	}
}

