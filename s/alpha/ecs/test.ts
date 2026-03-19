
import {GMap} from "@e280/stz"
import {suite, test, expect} from "@e280/science"
import {World} from "./parts/world.js"
import {create, del, update} from "./parts/changers.js"

export default suite({
	"create an entity": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		expect(world.entities.size).is(0)
		world.apply(create({mana: 0, regen: 1}))
		expect(world.entities.size).is(1)
	}),

	"wizard regens mana": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		const wizard = create({mana: 0, regen: 1})
		world.apply(wizard)
		const system = function*() {
			for (const [id, c] of world.select("mana", "regen")) {
				if (c.regen !== 0) {
					const mana = c.mana + c.regen
					yield update(id, {...c, mana})
				}
			}
		}
		const changes = world.execute([system])
		const [wizardId] = wizard
		expect(changes.length).is(1)
		expect(GMap.require(world.entities, wizardId).mana).is(1)
	}),

	"lifecycles": test(async() => {
		const world = new World<{mana: number, regen: number}>()
		let countCreated = 0
		let countUpdated = 0
		let countDeleted = 0
		const system = lifecycle(["mana", "regen"], (id, components) => {
			countCreated++
			return {
				updated: (id, components) => void countUpdated++,
				deleted: (id, components) => void countDeleted++,
			}
		})

		expect(countCreated).is(0)
		expect(countUpdated).is(0)
		expect(countDeleted).is(0)

		const wizard = create({mana: 0, regen: 1})
		const [wizardId] = wizard
		world.apply(wizard)
		world.execute([system])
		expect(countCreated).is(1)
		expect(countUpdated).is(0)
		expect(countDeleted).is(0)

		world.apply(update(wizardId, {mana: 0, regen: 2}))
		world.execute([system])
		expect(countCreated).is(1)
		expect(countUpdated).is(1)
		expect(countDeleted).is(0)

		world.apply(del(wizardId))
		world.execute([system])
		expect(countCreated).is(1)
		expect(countUpdated).is(1)
		expect(countDeleted).is(1)

		expect(world.entities.size).is(0)
	}),
})

