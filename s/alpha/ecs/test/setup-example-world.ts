
import {World} from "../parts/world.js"
import {del, update} from "../parts/changers.js"

export function setupExampleWorld() {
	const world = new World<{
		health: number
		bleed: number
		mana: number
		manaRegen: number
	}>()

	const systems = [
		function* manaRegen() {
			for (const [id, c] of world.select("mana", "manaRegen")) {
				if (c.manaRegen !== 0) {
					const mana = c.mana + c.manaRegen
					yield update(id, {...c, mana})
				}
			}
		},

		function* bleeding() {
			for (const [id, c] of world.select("health", "bleed")) {
				if (c.bleed !== 0) {
					const health = c.health - c.bleed
					yield update(id, {...c, health})
				}
			}
		},

		function* death() {
			for (const [id, c] of world.select("health")) {
				if (c.health <= 0)
					yield del(id)
			}
		},
	]

	return {world, systems}
}

