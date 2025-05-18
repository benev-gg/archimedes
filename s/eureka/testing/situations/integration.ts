
import {setupEureka} from "../../eureka.js"
import {EurekaContext} from "../../integration/context.js"

export class DemoContext extends EurekaContext {}

export type DemoComponents = {
	health: number
	bleeding: number
	mana: number
	manaRegen: number
}

export function setupEurekaDemo() {
	const eureka = setupEureka<DemoContext, DemoComponents>()
	const context = new DemoContext()
	const world = eureka.world(context, [

		eureka.system("mortality")
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

		eureka.system("wizardry")
			.select("mana").andMaybe("manaRegen")
			.fn((entities, _world) => {
				for (const {components} of entities)
					if (components.manaRegen)
						components.mana += components.manaRegen
			}),

	])
	return {context, world}
}

