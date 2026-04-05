
import {suite, test, expect} from "@e280/science"
import {lifecycle} from "./parts/lifecycle.js"
import {setupExample} from "./test/setup-example.js"
import {executeSystems} from "./parts/execute-systems.js"
import {setupLifecycleCounts} from "./test/setup-lifecycle-counts.js"

export default suite({
	"create an entity": test(async() => {
		const {entities, change} = setupExample()
		expect(entities.size).is(0)
		change.create({health: 100})
		expect(entities.size).is(1)
	}),

	"delete an entity": test(async() => {
		const {entities, change} = setupExample()
		const id = change.create({health: 100})
		expect(entities.size).is(1)
		change.delete(id)
		expect(entities.size).is(0)
	}),

	"merge components into entity": test(async() => {
		const {entities, change} = setupExample()
		const id = change.create({health: 100, mana: 100})
		expect(entities.require(id).health).is(100)
		change.merge(id, {health: 99})
		expect(entities.require(id).health).is(99)
		expect(entities.require(id).mana).is(100)
	}),

	"ignore merge after delete": test(async() => {
		const {entities, change} = setupExample()
		const id = change.create({health: 100, mana: 100})
		expect(entities.get(id)).ok()
		change.delete(id)
		expect(entities.get(id)).not.ok()
		change.merge(id, {health: 99})
		expect(entities.get(id)).not.ok()
	}),

	"ignore drop after delete": test(async() => {
		const {entities, change} = setupExample()
		const id = change.create({health: 100, mana: 100})
		expect(entities.get(id)).ok()
		change.delete(id)
		expect(entities.get(id)).not.ok()
		change.drop(id, "health")
		expect(entities.get(id)).not.ok()
	}),

	"select an entity": test(async() => {
		const {entities, change} = setupExample()
		change.create({health: 100})
		expect([...entities.select("health")].length).is(1)
	}),

	"drop components from entity": test(async() => {
		const {entities, change} = setupExample()
		const id = change.create({health: 100, mana: 100})
		expect([...entities.select("health", "mana")].length).is(1)
		change.drop(id, "mana")
		expect("mana" in entities.require(id)).is(false)
		expect([...entities.select("health", "mana")].length).is(0)
	}),

	"select two entities": test(async() => {
		const {entities, change} = setupExample()
		change.create({health: 100})
		change.create({health: 100})
		expect([...entities.select("health")].length).is(2)
	}),

	"select with no component keys selects all": test(async() => {
		const {entities, change} = setupExample()
		change.create({health: 100})
		change.create({health: 100})
		expect([...entities.select()].length).is(2)
	}),

	"select doesn't include non-match": test(async() => {
		const {entities, change} = setupExample()
		change.create({health: 100})
		expect([...entities.select("mana")].length).is(0)
	}),

	"select includes entities with extra components": test(async() => {
		const {entities, change} = setupExample()
		change.create({health: 100, mana: 100})
		expect([...entities.select("health")].length).is(1)
	}),

	"wizard regens mana": test(async() => {
		const {entities, change, systems} = setupExample()
		const wizardId = change.create({health: 100, mana: 50, manaRegen: 1})
		const changes = executeSystems(entities, systems)
		expect(changes.length).is(1)
		expect(entities.require(wizardId).mana).is(51)
	}),

	"death by bleeding": test(async() => {
		const {entities, change, systems} = setupExample()
		const wizardId = change.create({health: 3, bleed: 2})
		expect(entities.require(wizardId).health).is(3)
		executeSystems(entities, systems)
		expect(entities.require(wizardId).health).is(1)
		executeSystems(entities, systems)
		expect(entities.has(wizardId)).is(false)
	}),

	"lifecycles": test(async() => {
		const {entities, change} = setupExample()
		const counts = setupLifecycleCounts()
		const system = lifecycle(["health"], () => {
			counts.enters++
			return {
				tick: () => void counts.ticks++,
				exit: () => void counts.exits++,
			}
		})
		counts.expect(0, 0, 0)

		const wizardId = change.create({health: 100, mana: 50})
		executeSystems(entities, [system])
		counts.expect(1, 1, 0)

		change.merge(wizardId, {health: 100, mana: 100})
		executeSystems(entities, [system])
		counts.expect(1, 2, 0)

		change.delete(wizardId)
		executeSystems(entities, [system])
		counts.expect(1, 2, 1)
		expect(entities.size).is(0)
	}),

	"lifecycle can commit": test(async() => {
		const {entities, change} = setupExample()
		const system = lifecycle(["health"], (_id, _components, change) => {
			change.create({mana: 50})
			return {
				tick: () => {},
				exit: () => {},
			}
		})
		change.create({health: 100})
		executeSystems(entities, [system])
		expect([...entities.select("mana")].length).is(1)
	}),

	"lifecycle self-deletion immediate cleanup": test(async() => {
		const {entities, change} = setupExample()
		let ranExit = 0
		const system = lifecycle(["health"], (id, _components, change) => {
			return {
				tick: () => change.delete(id),
				exit: () => { ranExit++ },
			}
		})
		change.create({health: 100})
		expect([...entities.select("health")].length).is(1)
		expect(ranExit).is(0)
		executeSystems(entities, [system])
		expect(ranExit).is(1)
		expect([...entities.select("health")].length).is(0)
	}),
})

