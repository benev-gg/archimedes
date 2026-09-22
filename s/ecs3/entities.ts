
import {got} from "@e280/stz"
import {makeStore} from "./store/make.js"
import {Components, ComponentValues, EntityId, Patch} from "./types.js"

export class Entities<C extends Components> {
	#store

	constructor(public readonly components: C) {
		this.#store = makeStore(components)
	}

	clear() {
		this.#store = makeStore(this.components)
	}

	set(id: EntityId, values: Partial<ComponentValues<C>>) {
		// TODO
	}

	patch(id: EntityId, patch: Patch<C>) {
		// TODO
	}

	get size() {
		return this.#store.records.size
	}

	has(id: EntityId) {
		return this.#store.records.has(id)
	}

	get<V extends Partial<ComponentValues<C>> = Partial<ComponentValues<C>>>(id: EntityId): V | undefined {
		// TODO
		return {} as any
	}

	getWith<N extends keyof C>(id: EntityId, ...names: N[]) {
		const values = this.get(id)
		if (!values) return undefined
		for (const name of names)
			if (!Object.hasOwn(values, name))
				return undefined
		return values as any as Pick<ComponentValues<C>, N> & Partial<ComponentValues<C>>
	}

	*keys() {
		yield* this.#store.records.keys()
	}

	*values() {
		for (const id of this.#store.records.keys())
			yield got(this.get(id))
	}

	*entries() {
		for (const id of this.#store.records.keys())
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

