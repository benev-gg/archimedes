
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
		const counts = {
			enters: 0,
			ticks: 0,
			exits: 0,
			expect: (enters: number, ticks: number, exits: number) => {
				expect(counts.enters).is(enters)
				expect(counts.ticks).is(ticks)
				expect(counts.exits).is(exits)
			},
		}
		const system = world.lifecycle(["mana", "regen"], () => {
			counts.enters++
			return {
				tick: () => void counts.ticks++,
				exit: () => void counts.exits++,
			}
		})
		counts.expect(0, 0, 0)

		const wizard = create({mana: 0, regen: 1})
		const [wizardId] = wizard
		world.apply(wizard)
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

