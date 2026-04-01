
import {setupEureka} from "../../eureka.js"

class MyContext {}

type MyComponents = {
	health: number
	bleeding: number
	mana: number
	manaRegen: number
}

export function setupHealthSituation() {
	const eureka = setupEureka<MyContext, MyComponents>()

	const world = eureka.world(new MyContext(), [
		eureka.system("health")
			.select("health").andMaybe("bleeding")
			.fn((entities, world) => {
				for (const {id, components} of entities) {

					// process bleeding
					if (components.bleeding)
						components.health -= components.bleeding

					// process death
					if (components.health <= 0)
						world.delete(id)
				}
			}),

		eureka.system("mana")
			.select("mana").andMaybe("manaRegen")
			.fn((entities, _world) => {
				for (const {components} of entities)
					if (components.manaRegen)
						components.mana += components.manaRegen
			}),
	])

	return {world}
}

