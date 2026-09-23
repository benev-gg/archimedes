
import {got, need, sub} from "@e280/stz"
import {Change} from "./store/types.js"
import {makeStore} from "./store/make.js"
import {Selector} from "./utils/selector.js"
import {Components, ComponentValues, EntityId, Patch} from "./types.js"
import {storeCreateEntity, storeDeleteEntity, storeDeleteValue, storeGetValues, storeWriteValue} from "./store/store.js"

export class Entities<C extends Components> {
	beforeChange = sub<[Change]>()
	#store
	#selector = new Selector<C>(this)

	constructor(public readonly components: C) {
		this.#store = makeStore(components)
	}

	clear() {
		for (const id of this.keys()) {
			this.beforeChange.publish([id])
			this.#selector.entityGone(id)
		}
		this.#store = makeStore(this.components)
	}

	get version() {
		return this.#store.version
	}

	get(id: EntityId) {
		const values = storeGetValues(this.#store, id)
		return values as Partial<ComponentValues<C>> | undefined
	}

	got(id: EntityId) {
		return need(this, id)
	}

	delete(id: EntityId) {
		this.beforeChange.publish([id])
		this.#selector.entityGone(id)
		return storeDeleteEntity(this.#store, id)
	}

	set<V extends Partial<ComponentValues<C>>>(id: EntityId, values: V) {
		this.beforeChange.publish([id])
		this.#selector.entityChanged(id, values)

		if (!this.#store.addresses.has(id))
			storeCreateEntity(this.#store, id)

		const addresses = this.#store.addresses.get(id)!

		for (const code of [...addresses.keys()]) {
			const name = this.#store.namecoder.name(code)
			if (!Object.hasOwn(values, name))
				storeDeleteValue(this.#store, id, code)
		}

		for (const [name, value] of Object.entries(values)) {
			const code = this.#store.namecoder.code(name)
			storeWriteValue(this.#store, id, code, value)
		}

		return id
	}

	update(id: EntityId, patch: Patch<C>) {
		if (!this.#store.addresses.has(id))
			return false

		for (const [name, value] of Object.entries(patch)) {
			const code = this.#store.namecoder.code(name)
			this.beforeChange.publish([id, code])

			if (value === undefined)
				storeDeleteValue(this.#store, id, code)
			else
				storeWriteValue(this.#store, id, code, value)
		}

		this.#selector.entityChanged(id, this.got(id))
		return true
	}

	getWith<N extends keyof C>(id: EntityId, ...names: N[]) {
		const values = this.get(id)
		if (!values) return undefined
		for (const name of names)
			if (!Object.hasOwn(values, name))
				return undefined
		return values as
			& Pick<ComponentValues<C>, N>
			& Partial<ComponentValues<C>>
	}

	get size() {
		return this.#store.addresses.size
	}

	has(id: EntityId) {
		return this.#store.addresses.has(id)
	}

	*keys() {
		yield* this.#store.addresses.keys()
	}

	*values() {
		for (const id of this.#store.addresses.keys())
			yield got(this.get(id))
	}

	*entries() {
		for (const id of this.#store.addresses.keys())
			yield [id, got(this.get(id))] as [EntityId, Partial<ComponentValues<C>>]
	}

	*[Symbol.iterator]() {
		yield* this.entries()
	}

	save() {
		// // TODO
		// return storeSave(this.#store)
	}

	load(file: Uint8Array) {
		this.clear()
		// // TODO
		// storeLoad(this.#store, file)
	}

	select<N extends keyof C>(...componentNames: N[]) {
		return this.#selector.select(...componentNames)
	}
}

