
import {Change} from "../parts/change.js"
import {asSystems} from "../parts/types.js"
import {Entities} from "../parts/entities.js"
import {applyDelta} from "../parts/apply-delta.js"

export function setupExample() {
	type MyComponents = {
		health: number
		bleed: number
		mana: number
		manaRegen: number
	}

	const systems = asSystems<MyComponents>(
		function manaRegen(entities, change) {
			for (const [id, components] of entities.select("mana", "manaRegen")) {
				if (components.manaRegen !== 0) {
					const mana = components.mana + components.manaRegen
					change.merge(id, {mana})
				}
			}
		},

		function bleeding(entities, change) {
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

		function death(entities, change) {
			for (const [id, components] of entities.select("health")) {
				if (components.health <= 0)
					change.delete(id)
			}
		},
	)

	const entities = new Entities<MyComponents>()
	const change = new Change<MyComponents>(delta => applyDelta(entities, delta))

	return {systems, entities, change}
}

