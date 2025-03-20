
import {EurekaSchema} from "./types.js"
import {EurekaContext} from "./context.js"
import {Components} from "../parts/types.js"
import {Assembly} from "../parts/assembly.js"
import {Simulator} from "../../core/simulator.js"
import {AuthorId, Dispatch, Telegram} from "../../core/types.js"

export class EurekaSimulator
	<xContext extends EurekaContext, C extends Components>
	extends Simulator<EurekaSchema<C>> {

	#deltas: EurekaSchema<C>["delta"] = []
	#authorityId = 0

	constructor(
			public assembly: Assembly<xContext, C>,
			state: EurekaSchema<C>["state"],
		) {
		super(state)
		assembly.on.created(entity => void this.#deltas.push(["update", [entity.id, entity.components]]))
		assembly.on.updated(entity => void this.#deltas.push(["update", [entity.id, entity.components]]))
		assembly.on.deleted(id => void this.#deltas.push(["delete", id]))
	}

	simulate(telegram: Telegram<EurekaSchema<C>>): EurekaSchema<C>["delta"] {
		this.#deltas = []

		Simulator.handleTelegram(telegram, {
			input: (inputs) => {
				this.assembly.context.inputs.add(inputs)
			},

			state: (state, authorId) => {
				if (authorId === this.#authorityId)
					this.assembly.overwrite(state)
			},

			delta: (deltas, authorId) => {
				if (authorId === this.#authorityId)
					return undefined
				for (const [kind, payload] of deltas) {
					if (kind === "update") {
						const [id, entity] = payload
						this.assembly.write(id, entity)
					}
					else {
						const id = payload
						this.assembly.delete(id)
					}
				}
			},
		})

		this.assembly.execute()
		return this.#deltas
	}

	tailor(audienceAuthorId: AuthorId, telegram: Telegram<EurekaSchema<C>>): Telegram<EurekaSchema<C>> {
		const relevantEntities = this.assembly.context.relevance.author(audienceAuthorId)
		const [telegramAuthorId, dispatches] = telegram
		const relevantDispatches: Dispatch<EurekaSchema<C>>[] = []
		for (const [kind, x] of dispatches) {
			switch (kind) {

				case "state": {
					relevantDispatches.push([kind, x.filter(([id]) => relevantEntities.has(id))])
				} break

				case "delta": {
					relevantDispatches.push([kind, x.filter(([deltaKind, y]) => {
						if (deltaKind === "update") return relevantEntities.has(y[0])
						else return relevantEntities.has(y)
					})])
				} break

				case "input": {
					const [authorId, inputEntries] = x
					relevantDispatches.push([
						kind,
						[authorId, inputEntries.filter(([id]) => relevantEntities.has(id))],
					])
				} break
			}
		}
		return [telegramAuthorId, relevantDispatches]
	}
}

