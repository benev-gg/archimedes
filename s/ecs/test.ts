
import {expect, suite, test} from "@e280/science"
import {tuple} from "./parts/tuple.js"
import {Entities} from "./entities.js"
import {asComponents} from "./types.js"
import {makeId} from "./parts/make-id.js"
import {bytes, i8, json, u16, u8, vec3} from "./components.js"

const setupComponents = () => asComponents({
	health: i8,
	position: vec3,
	data: json(),
	payload: bytes(),
})

export default suite({
	"entities": suite({
		"set/get": test(async() => {
			const entities = new Entities(setupComponents())
			const unknown = makeId()
			const id = entities.set(makeId(), {health: 100, position: [1, 2, 3]})
			expect(entities.get(id)).deep({health: 100, position: [1, 2, 3]})
			expect(entities.get(unknown)).is(undefined)
		}),

		"maplike methods and iteration": test(async() => {
			const entities = new Entities(setupComponents())
			const a = entities.set(makeId(), {health: 101})
			const b = entities.set(makeId(), {health: 102})
			const c = entities.set(makeId(), {health: 103})
			expect(entities.has(a)).is(true)
			expect(entities.size).is(3)
			expect([...entities.keys()]).deep([a, b, c])
			expect([...entities.entries()].length).is(3)
		}),

		"got": test(async() => {
			const entities = new Entities(setupComponents())
			const id = entities.set(makeId(), {health: 101})
			const unknown = makeId()
			expect(entities.got(id)).ok()
			expect(() => entities.got(unknown)).throws()
		}),

		"set replaces": test(async() => {
			const entities = new Entities(setupComponents())
			const id = makeId()
			entities.set(id, {health: 100, position: [1, 2, 3]})
			entities.set(id, {health: 64})
			expect(entities.got(id)).deep({health: 64})
		}),

		"update": test(async() => {
			const entities = new Entities(setupComponents())
			const id = makeId()
			entities.set(id, {health: 128, position: [1, 2, 3]})
			entities.update(id, {health: 64, position: undefined})
			expect(entities.got(id)).deep({health: 64})
		}),

		"empty entity": test(async() => {
			const entities = new Entities(setupComponents())
			const id = makeId()
			entities.set(id, {health: 100})
			entities.set(id, {})
			expect(entities.has(id)).is(true)
			expect(entities.got(id)).deep({})
		}),

		"delete": test(async() => {
			const entities = new Entities(setupComponents())
			const id = makeId()
			entities.set(id, {health: 100})
			entities.delete(id)
			expect(entities.has(id)).is(false)
			expect(entities.size).is(0)
		}),

		"variable components": test(async() => {
			const entities = new Entities(setupComponents())
			const id = makeId()
			entities.set(id, {
				data: {name: "wizard", level: 7},
				payload: new Uint8Array([1, 2, 3]),
			})
			const v = entities.got(id)
			expect(v.data).deep({name: "wizard", level: 7})
			expect([...v.payload!]).deep([1, 2, 3])
		}),

		"slot reuse": test(async() => {
			const entities = new Entities(setupComponents())
			const a = makeId(), b = makeId(), c = makeId()
			entities.set(a, {health: 10})
			entities.set(b, {health: 20})
			entities.delete(a)
			entities.set(c, {health: 30})
			expect(entities.got(b)).deep({health: 20})
			expect(entities.got(c)).deep({health: 30})
		}),

		"select": test(async() => {
			const entities = new Entities(setupComponents())
			entities.set(makeId(), {
				health: 100,
			})
			entities.set(makeId(), {
				health: 100,
				position: [1, 2, 3],
			})
			expect(entities.select("health").length).is(2)
			expect(entities.select("position").length).is(1)
			expect(entities.select("health", "position").length).is(1)
		}),
	}),

	"component schema": suite({
		"component rename changes version": test(async() => {
			expect(new Entities({a: u8}).version)
				.not.is(new Entities({b: u8}).version)
		}),

		"same schema is stable": test(async() => {
			expect(new Entities({a: u8, b: tuple(u16, u8)}).version)
				.is(new Entities({a: u8, b: tuple(u16, u8)}).version)
		}),

		"reordering is fine": test(async() => {
			expect(new Entities({a: u8, b: u16}).version)
				.is(new Entities({b: u16, a: u8}).version)
		}),

		"change one component, version changes": test(async() => {
			expect(new Entities({a: u8, b: u16}).version)
				.not.is(new Entities({a: u8, b: u8}).version)
		}),

		"add one component, version changes": test(async() => {
			expect(new Entities({a: u8, b: u16}).version)
				.not.is(new Entities({a: u8, b: u16, c: u8}).version)
		}),

		"component inside tuple changes, version changes": test(async() => {
			expect(new Entities({a: tuple(u8, u8)}).version)
				.not.is(new Entities({a: tuple(u8, u16)}).version)
		}),
	}),

	"changes": suite({
		"stream changes from one entities to another": test(async() => {
			const entitiesA = new Entities(setupComponents())
			const entitiesB = new Entities(setupComponents())

			const recording = entitiesA.startRecordingChanges()
			const id = entitiesA.set(makeId(), {health: 99, position: [1, 2, 3]})
			entitiesA.update(id, {data: {bingus: 5}})
			entitiesA.update(id, {position: undefined})
			const changes = recording.done()

			expect([...entitiesA]).not.deep([...entitiesB])
			entitiesB.applyChanges(changes)
			expect([...entitiesA]).deep([...entitiesB])
		}),

		"patch and delete": test(async() => {
			const entitiesA = new Entities(setupComponents())
			const entitiesB = new Entities(setupComponents())
			const id = entitiesA.set(makeId(), {health: 100, position: [1, 2, 3]})
			entitiesB.load(entitiesA.save())

			const recording = entitiesA.startRecordingChanges()
			entitiesA.update(id, {
				health: 50,
				position: undefined,
				data: {bingus: 5},
			})
			entitiesB.applyChanges(recording.done())
			expect([...entitiesA]).deep([...entitiesB])
		}),

		"create and destroy": test(async() => {
			const entitiesA = new Entities(setupComponents())
			const entitiesB = new Entities(setupComponents())

			const existing = entitiesA.set(makeId(), {health: 100})
			entitiesB.load(entitiesA.save())

			const recording = entitiesA.startRecordingChanges()
			entitiesA.delete(existing)
			entitiesA.set(makeId(), {health: 77, data: {wizard: true}})
			entitiesB.applyChanges(recording.done())

			expect([...entitiesA]).deep([...entitiesB])
		}),
	}),

	"save/load": suite({
		"roundtrip": test(async() => {
			const entitiesA = new Entities(setupComponents())
			entitiesA.set(makeId(), {health: 100, position: [1, 2, 3]})
			entitiesA.set(makeId(), {payload: new Uint8Array([1, 2, 3])})
			entitiesA.set(makeId(), {data: {alpha: 123}})
			const entitiesB = new Entities(setupComponents())
			entitiesB.load(entitiesA.save())
			expect([...entitiesA]).deep([...entitiesB])
		}),

		"schema mismatch throws": test(async() => {
			const entitiesA = new Entities({health: i8, mana: u8})
			const entitiesB = new Entities({health: i8, mana: i8})
			expect(() => entitiesB.load(entitiesA.save())).throws()
		}),
	}),
})

