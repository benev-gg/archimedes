
import {Change} from "../parts/change.js"
import {asSystems} from "../parts/types.js"
import {Entities} from "../parts/entities.js"
import {makeExecute} from "../parts/execute.js"
import {applyDelta} from "../parts/apply-delta.js"

export type ExampleComponents = {
	health: number
	bleed: number
	mana: number
	manaRegen: number
}

export function setupExample() {
	const entities = new Entities<ExampleComponents>()
	const rentities = entities.readonly

	const systems = asSystems<ExampleComponents>(change => [
		function manaRegen() {
			for (const [id, components] of rentities.select("mana", "manaRegen")) {
				if (components.manaRegen !== 0) {
					const mana = components.mana + components.manaRegen
					change.merge(id, {mana})
				}
			}
		},

		function bleeding() {
			for (const [id, components] of rentities.select("health", "bleed")) {
				if (components.bleed >= 0) {
					const health = components.health - components.bleed
					const bleed = components.bleed - 1
					change.merge(id, {health, bleed})
				}
				if (components.bleed <= 0)
					change.drop(id, "bleed")
			}
		},

		function death() {
			for (const [id, components] of rentities.select("health")) {
				if (components.health <= 0)
					change.delete(id)
			}
		},
	])

	const change = new Change<ExampleComponents>(delta => applyDelta(entities, delta))
	const execute = makeExecute(entities, systems)

	return {systems, entities, change, execute}
}

