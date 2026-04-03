
import {change} from "../parts/change.js"
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

	const systems = [
		function* manaRegen() {
			for (const [id, c] of entities.select("mana", "manaRegen")) {
				if (c.manaRegen !== 0) {
					const mana = c.mana + c.manaRegen
					yield change.patch(id, {mana})
				}
			}
		},

		function* bleeding() {
			for (const [id, c] of entities.select("health", "bleed")) {
				if (c.bleed !== 0) {
					const health = c.health - c.bleed
					yield change.patch(id, {health})
				}
			}
		},

		function* death() {
			for (const [id, c] of entities.select("health")) {
				if (c.health <= 0)
					yield change.delete(id)
			}
		},
	]

	return {entities: writableEntities, systems}
}

