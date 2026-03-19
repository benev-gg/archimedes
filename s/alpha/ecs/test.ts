
import {GMap} from "@e280/stz"
import {suite, test, expect} from "@e280/science"
import {World} from "./parts/world.js"
import {create, del, update} from "./parts/changers.js"
import {setupLifecycleCounts} from "./test/setup-lifecycle-counts.js"

export default suite({
	"create an entity": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		expect(world.entities.size).is(0)
		world.apply(create({mana: 0, regen: 1}))
		expect(world.entities.size).is(1)
	}),

	"wizard regens mana": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		const wizardId = world.apply(create({mana: 0, regen: 1}))
		const system = function*() {
			for (const [id, c] of world.select("mana", "regen")) {
				if (c.regen !== 0) {
					const mana = c.mana + c.regen
					yield update(id, {...c, mana})
				}
			}
		}
		const changes = world.execute([system])
		expect(changes.length).is(1)
		expect(GMap.require(world.entities, wizardId).mana).is(1)
	}),

	"lifecycles": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		const counts = setupLifecycleCounts()
		const system = world.lifecycle(["mana", "regen"], () => {
			counts.enters++
			return {
				tick: () => void counts.ticks++,
				exit: () => void counts.exits++,
			}
		})
		counts.expect(0, 0, 0)

		const wizardId = world.apply(create({mana: 0, regen: 1}))
		world.execute([system])
		counts.expect(1, 1, 0)

		world.apply(update(wizardId, {mana: 0, regen: 2}))
		world.execute([system])
		counts.expect(1, 2, 0)

		world.apply(del(wizardId))
		world.execute([system])
		counts.expect(1, 2, 1)
		expect(world.entities.size).is(0)
	}),
})

