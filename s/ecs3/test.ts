
import {expect, suite, test} from "@e280/science"
import {Entities} from "./entities.js"
import {makeId} from "./utils/make-id.js"
import {blob, json, u8, vec3} from "./components.js"

const setup = () => new Entities({
	health: u8,
	position: vec3,
	data: json,
	payload: blob,
})

export default suite({
	"entities": suite({
		"set/get": test(async() => {
			const entities = setup()
			const id = makeId()
			const unknown = makeId()
			entities.set(id, {health: 128, position: [1, 2, 3]})
			expect(entities.get(id)).deep({health: 128, position: [1, 2, 3]})
			expect(entities.get(unknown)).is(undefined)
		}),

		"maplike methods and iteration": test(async() => {
			const entities = setup()
			const a = entities.set(makeId(), {health: 101})
			const b = entities.set(makeId(), {health: 102})
			const c = entities.set(makeId(), {health: 103})
			expect(entities.has(a)).is(true)
			expect(entities.size).is(3)
			expect([...entities.keys()]).deep([a, b, c])
			expect([...entities.entries()].length).is(3)
		}),

		"got": test(async() => {
			const entities = setup()
			const id = entities.set(makeId(), {health: 101})
			const unknown = makeId()
			expect(entities.got(id)).ok()
			expect(() => entities.got(unknown)).throws()
		}),

		"set replaces": test(async() => {
			const entities = setup()
			const id = makeId()
			entities.set(id, {health: 128, position: [1, 2, 3]})
			entities.set(id, {health: 64})
			expect(entities.got(id)).deep({health: 64})
		}),

		"patch": test(async() => {
			const entities = setup()
			const id = makeId()
			entities.set(id, {health: 128, position: [1, 2, 3]})
			entities.patch(id, {health: 64, position: undefined})
			expect(entities.got(id)).deep({health: 64})
		}),

		"empty entity": test(async() => {
			const entities = setup()
			const id = makeId()
			entities.set(id, {health: 100})
			entities.set(id, {})
			expect(entities.has(id)).is(true)
			expect(entities.got(id)).deep({})
		}),

		"delete": test(async() => {
			const entities = setup()
			const id = makeId()
			entities.set(id, {health: 100})
			entities.delete(id)
			expect(entities.has(id)).is(false)
			expect(entities.size).is(0)
		}),

		"variable components": test(async() => {
			const entities = setup()
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
			const entities = setup()
			const a = makeId(), b = makeId(), c = makeId()
			entities.set(a, {health: 10})
			entities.set(b, {health: 20})
			entities.delete(a)
			entities.set(c, {health: 30})
			expect(entities.got(b)).deep({health: 20})
			expect(entities.got(c)).deep({health: 30})
		}),
	}),
})

