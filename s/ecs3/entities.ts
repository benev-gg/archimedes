
import {got, need} from "@e280/stz"
import {makeStore} from "./store/make.js"
import {Components, ComponentValues, EntityId, Patch} from "./types.js"
import {storeCreateEntity, storeDeleteEntity, storeDeleteValue, storeGetValues, storeWriteValue} from "./store/fns.js"

export class Entities<C extends Components> {
	#store

	constructor(public readonly components: C) {
		this.#store = makeStore(components)
	}

	clear() {
		this.#store = makeStore(this.components)
	}

	get(id: EntityId) {
		const values = storeGetValues(this.#store, id)
		return values as Partial<ComponentValues<C>> | undefined
	}

	got(id: EntityId) {
		return need(this, id)
	}

	delete(id: EntityId) {
		return storeDeleteEntity(this.#store, id)
	}

	set<V extends Partial<ComponentValues<C>>>(id: EntityId, values: V) {
		if (!this.#store.addresses.has(id))
			storeCreateEntity(this.#store, id)

		const addresses = this.#store.addresses.get(id)!

		// Remove components absent from the replacement value.
		for (const code of [...addresses.keys()]) {
			const name = this.#store.namecoder.name(code)

			if (!Object.hasOwn(values, name))
				storeDeleteValue(this.#store, id, code)
		}

		// Write all supplied components.
		for (const [name, value] of Object.entries(values)) {
			const code = this.#store.namecoder.code(name)
			storeWriteValue(this.#store, id, code, value)
		}

		return id
	}

	patch(id: EntityId, patch: Patch<C>) {
		if (!this.#store.addresses.has(id))
			return false

		for (const [name, value] of Object.entries(patch)) {
			const code = this.#store.namecoder.code(name)

			if (value === undefined)
				storeDeleteValue(this.#store, id, code)
			else
				storeWriteValue(this.#store, id, code, value)
		}

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
		// return storeSave(this.#dataplate)
	}

	load(file: Uint8Array) {
		this.clear()
		// // TODO
		// storeLoad(this.#dataplate, file)
	}

	select<N extends keyof C>(...componentNames: N[]): [EntityId, Pick<ComponentValues<C>, N>][] {
		// TODO later
		return []
	}
}

