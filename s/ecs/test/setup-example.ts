
import {Change} from "../parts/change.js"
import {consolidate} from "../parts/systems.js"
import {Delta, Systems} from "../parts/types.js"
import {applyDelta} from "../parts/apply-delta.js"
import {Entities, EntitiesReadonly} from "../parts/entities.js"

export type ExampleComponents = {
	health: number
	bleed: number
	mana: number
	manaRegen: number
}

export type ExampleContext = {
	entities: EntitiesReadonly<ExampleComponents>
	change: Change<ExampleComponents>
}

export function setupExample(
		options: {moreSystems?: Systems<ExampleContext>} = {}
	) {

	const entities = new Entities<ExampleComponents>()
	let deltas: Delta<ExampleComponents>[] = []
	const change = new Change<ExampleComponents>(delta => {
		deltas.push(delta)
		applyDelta(entities, delta)
	})

	const context: ExampleContext = {entities: entities.readonly, change}

	const simulate = consolidate(context, {
		mana_regen: ({entities, change}) => () => {
			for (const [id, components] of entities.select("mana", "manaRegen")) {
				if (components.manaRegen !== 0) {
					const mana = components.mana + components.manaRegen
					change.merge(id, {mana})
				}
			}
		},

		bleeding: ({entities, change}) => () => {
			for (const [id, components] of entities.select("health", "bleed")) {
				if (components.bleed >= 0) {
					const health = components.health - components.bleed
					const bleed = components.bleed - 1
					change.merge(id, {health, bleed})
				}
				if (components.bleed <= 0)
					change.drop(id, "bleed")
			}
		},

		death: ({entities, change}) => () => {
			for (const [id, components] of entities.select("health")) {
				if (components.health <= 0)
					change.delete(id)
			}
		},

		...(options.moreSystems ?? {}),
	})

	const execute = () => {
		deltas = []
		simulate()
		return deltas
	}

	return {entities, change, execute}
}

