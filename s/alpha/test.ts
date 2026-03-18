
import {GMap} from "@e280/stz"
import {suite, test, expect} from "@e280/science"
import {makeWorld} from "./parts/world.js"

export default suite({
	"create an entity": test(async() => {
		const world = makeWorld<{mana: number, regen: number}>()
		expect(world.entities.size).is(0)
		world.apply(world.create({mana: 0, regen: 1}))
		expect(world.entities.size).is(1)
	}),

	"execute systems to effect change": test(async() => {
		const world = makeWorld<{mana: number, regen: number}>()
		const wizard = world.create({mana: 0, regen: 1})
		world.apply(wizard)
		const changes = world.execute([
			function *regenMana() {
				for (const [id, c] of world.select("mana", "regen")) {
					if (c.regen !== 0) {
						const mana = c.mana + c.regen
						yield world.update(id, {...c, mana})
					}
				}
			},
		])
		const [wizardId] = wizard
		expect(changes.length).is(1)
		expect(GMap.require(world.entities, wizardId).mana).is(1)
	}),
})

