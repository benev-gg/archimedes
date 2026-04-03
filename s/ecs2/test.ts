
import {suite, test, expect} from "@e280/science"
import {change} from "./parts/change.js"
import {applyChange} from "./parts/apply-change.js"
import {setupExample} from "./test/setup-example.js"
import {setupLifecycleCounts} from "./test/setup-lifecycle-counts.js"

export default suite({
	"create an entity": test(async() => {
		const {entities} = setupExample()
		expect(entities.size).is(0)
		applyChange(entities, change.create({health: 100}))
		expect(entities.size).is(1)
	}),

	"delete an entity": test(async() => {
		const {world} = setupExample()
		const id = world.apply(create({health: 100}))
		expect(world.entities.size).is(1)
		world.apply(del(id))
		expect(world.entities.size).is(0)
	}),

	"partial updates": test(async() => {
		const {world} = setupExampleWorld()
		const id = world.apply(create({health: 100, mana: 100}))
		expect(world.require(id).health).is(100)
		world.apply(update(id, {health: 99}))
		expect(world.require(id).health).is(99)
		expect(world.require(id).mana).is(100)
	}),

	"select an entity": test(async() => {
		const {world} = setupExampleWorld()
		world.apply(create({health: 100}))
		expect([...world.select("health")].length).is(1)
	}),

	"select an entity after shape change": test(async() => {
		const {world} = setupExampleWorld()
		const id = world.apply(create({health: 100, mana: 100}))
		expect([...world.select("health", "mana")].length).is(1)
		world.apply(update(id, {health: 99, mana: null}))
		expect([...world.select("health", "mana")].length).is(0)
	}),

	"select two entities": test(async() => {
		const {world} = setupExampleWorld()
		world.apply(create({health: 100}))
		world.apply(create({health: 100}))
		expect([...world.select("health")].length).is(2)
	}),

	"select with no component keys selects all": test(async() => {
		const {world} = setupExampleWorld()
		world.apply(create({health: 100}))
		world.apply(create({health: 100}))
		expect([...world.select()].length).is(2)
	}),

	"select doesn't include non-match": test(async() => {
		const {world} = setupExampleWorld()
		world.apply(create({health: 100}))
		expect([...world.select("mana")].length).is(0)
	}),

	"select includes entities with extra components": test(async() => {
		const {world} = setupExampleWorld()
		world.apply(create({health: 100, mana: 100}))
		expect([...world.select("health")].length).is(1)
	}),

	"wizard regens mana": test(async() => {
		const {world, systems} = setupExampleWorld()
		const wizardId = world.apply(create({health: 100, mana: 50, manaRegen: 1}))
		const changes = world.execute(systems)
		expect(changes.length).is(1)
		expect(world.require(wizardId).mana).is(51)
	}),

	"death by bleeding": test(async() => {
		const {world, systems} = setupExampleWorld()
		const wizardId = world.apply(create({health: 2, bleed: 1}))
		expect(world.require(wizardId).health).is(2)
		world.execute(systems)
		expect(world.require(wizardId).health).is(1)
		world.execute(systems)
		expect(world.entities.has(wizardId)).is(false)
	}),

	"lifecycles": test(async() => {
		const {world} = setupExampleWorld()
		const counts = setupLifecycleCounts()
		const system = world.lifecycle(["health"], () => {
			counts.enters++
			return {
				tick: () => void counts.ticks++,
				exit: () => void counts.exits++,
			}
		})
		counts.expect(0, 0, 0)

		const wizardId = world.apply(create({health: 100, mana: 50}))
		world.execute([system])
		counts.expect(1, 1, 0)

		world.apply(update(wizardId, {health: 100, mana: 100}))
		world.execute([system])
		counts.expect(1, 2, 0)

		world.apply(del(wizardId))
		world.execute([system])
		counts.expect(1, 2, 1)
		expect(world.entities.size).is(0)
	}),
})

