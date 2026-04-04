
import {suite, test, expect} from "@e280/science"
import {change} from "./parts/change.js"
import {lifecycle} from "./parts/lifecycle.js"
import {applyChange} from "./parts/apply-change.js"
import {setupExample} from "./test/setup-example.js"
import {executeSystems} from "./parts/execute-systems.js"
import {setupLifecycleCounts} from "./test/setup-lifecycle-counts.js"

export default suite({
	"create an entity": test(async() => {
		const {entities} = setupExample()
		expect(entities.size).is(0)
		applyChange(entities, change.create({health: 100}))
		expect(entities.size).is(1)
	}),

	"delete an entity": test(async() => {
		const {entities} = setupExample()
		const id = applyChange(entities, change.create({health: 100}))
		expect(entities.size).is(1)
		applyChange(entities, change.delete(id))
		expect(entities.size).is(0)
	}),

	"merge components into entity": test(async() => {
		const {entities} = setupExample()
		const id = applyChange(entities, change.create({health: 100, mana: 100}))
		expect(entities.require(id).health).is(100)
		applyChange(entities, change.merge(id, {health: 99}))
		expect(entities.require(id).health).is(99)
		expect(entities.require(id).mana).is(100)
	}),

	"select an entity": test(async() => {
		const {entities} = setupExample()
		applyChange(entities, change.create({health: 100}))
		expect([...entities.select("health")].length).is(1)
	}),

	"drop components from entity": test(async() => {
		const {entities} = setupExample()
		const id = applyChange(entities, change.create({health: 100, mana: 100}))
		expect([...entities.select("health", "mana")].length).is(1)
		applyChange(entities, change.drop(id, "mana"))
		expect("mana" in entities.require(id)).is(false)
		expect([...entities.select("health", "mana")].length).is(0)
	}),

	"select two entities": test(async() => {
		const {entities} = setupExample()
		applyChange(entities, change.create({health: 100}))
		applyChange(entities, change.create({health: 100}))
		expect([...entities.select("health")].length).is(2)
	}),

	"select with no component keys selects all": test(async() => {
		const {entities} = setupExample()
		applyChange(entities, change.create({health: 100}))
		applyChange(entities, change.create({health: 100}))
		expect([...entities.select()].length).is(2)
	}),

	"select doesn't include non-match": test(async() => {
		const {entities} = setupExample()
		applyChange(entities, change.create({health: 100}))
		expect([...entities.select("mana")].length).is(0)
	}),

	"select includes entities with extra components": test(async() => {
		const {entities} = setupExample()
		applyChange(entities, change.create({health: 100, mana: 100}))
		expect([...entities.select("health")].length).is(1)
	}),

	"wizard regens mana": test(async() => {
		const {entities, systems} = setupExample()
		const creating = change.create({health: 100, mana: 50, manaRegen: 1})
		const wizardId = creating[1]
		applyChange(entities, creating)
		const changes = executeSystems(entities, systems)
		expect(changes.length).is(1)
		expect(entities.require(wizardId).mana).is(51)
	}),

	"death by bleeding": test(async() => {
		const {entities, systems} = setupExample()
		const creating = change.create({health: 3, bleed: 2})
		const wizardId = creating[1]
		applyChange(entities, creating)
		expect(entities.require(wizardId).health).is(3)
		executeSystems(entities, systems)
		expect(entities.require(wizardId).health).is(1)
		executeSystems(entities, systems)
		expect(entities.has(wizardId)).is(false)
	}),

	"lifecycles": test(async() => {
		const {entities} = setupExample()
		const counts = setupLifecycleCounts()
		const system = lifecycle(entities.readonly(), ["health"], () => {
			counts.enters++
			return {
				tick: () => void counts.ticks++,
				exit: () => void counts.exits++,
			}
		})
		counts.expect(0, 0, 0)

		const creating = change.create({health: 100, mana: 50})
		const wizardId = creating[1]
		applyChange(entities, creating)
		executeSystems(entities, [system])
		counts.expect(1, 1, 0)

		applyChange(entities, change.merge(wizardId, {health: 100, mana: 100}))
		executeSystems(entities, [system])
		counts.expect(1, 2, 0)

		applyChange(entities, change.delete(wizardId))
		executeSystems(entities, [system])
		counts.expect(1, 2, 1)
		expect(entities.size).is(0)
	}),
})

