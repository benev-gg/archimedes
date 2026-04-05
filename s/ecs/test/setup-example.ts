
import {change} from "../parts/change.js"
import {asSystems} from "../parts/types.js"
import {Entities} from "../parts/entities.js"

export function setupExample() {
	type MyComponents = {
		health: number
		bleed: number
		mana: number
		manaRegen: number
	}

	const writableEntities = new Entities<MyComponents>()
	const entities = writableEntities.readonly()

	const systems = asSystems<MyComponents>(
		function manaRegen(commit) {
			for (const [id, components] of entities.select("mana", "manaRegen")) {
				if (components.manaRegen !== 0) {
					const mana = components.mana + components.manaRegen
					commit(change.merge(id, {mana}))
				}
			}
		},

		function bleeding(commit) {
			for (const [id, components] of entities.select("health", "bleed")) {
				if (components.bleed >= 0) {
					const health = components.health - components.bleed
					const bleed = components.bleed - 1
					commit(change.merge(id, {health, bleed}))
				}
				if (components.bleed <= 0)
					commit(change.drop(id, "bleed"))
			}
		},

		function death(commit) {
			for (const [id, components] of entities.select("health")) {
				if (components.health <= 0)
					commit(change.delete(id))
			}
		},
	)

	return {entities: writableEntities, systems}
}
