
import {need} from "@e280/stz"
import {Components, Id, Select} from "./types.js"

export class Entities<C extends Components> extends Map<Id, Partial<C>> {
	#index = new Map<Set<keyof C>, Map<Id, Partial<C>>>()

	set(id: Id, components: Partial<C>) {
		super.set(id, components)
		for (const [set, entities] of this.#index) {
			if (componentsSatisfySet(components, set))
				entities.set(id, components)
			else
				entities.delete(id)
		}
		return this
	}

	delete(id: Id) {
		const didDelete = super.delete(id)
		if (!didDelete)
			return false

		for (const entities of this.#index.values())
			entities.delete(id)

		return true
	}

	clear() {
		super.clear()
		for (const entities of this.#index.values())
			entities.clear()
	}

	*select<K extends keyof C>(...componentKeys: K[]): Iterable<[Id, Select<C, K>]> {
		const cached = this.#getCache(componentKeys)
		if (cached)
			yield* cached
		else
			yield* this.#makeCache(componentKeys)
	}

	get readonly() {
		return this as EntitiesReadonly<C>
	}

	#getCache<K extends keyof C>(componentKeys: K[]) {
		for (const set of this.#index.keys()) {
			if (setHasSameValuesAsArray(set, componentKeys))
				return need(this.#index, set) as Map<Id, Select<C, K>>
		}
	}

	*#makeCache<K extends keyof C>(componentKeys: K[]) {
		const set = new Set(componentKeys)
		const entities = new Map<Id, Partial<C>>()
		this.#index.set(set, entities)

		for (const entity of this) {
			const [id, components] = entity

			if (componentsSatisfyKeys(components, componentKeys)) {
				entities.set(id, components)
				yield entity as [Id, Select<C, K>]
			}
		}
	}
}

export type EntitiesReadonly<C extends Components> = Pick<Entities<Readonly<C>>, (
	| "has"
	| "get"
	| "keys"
	| "values"
	| "entries"
	| "select"
	| typeof Symbol.iterator
)>

function componentsSatisfySet(components: Components, set: Set<PropertyKey>) {
	for (const key of set)
		if (!(key in components))
			return false
	return true
}

function setHasSameValuesAsArray(set: Set<unknown>, keys: unknown[]) {
	if (set.size !== keys.length)
		return false
	return keys.every(key => set.has(key))
}

function componentsSatisfyKeys(components: object, keys: PropertyKey[]) {
	return keys.every(key => key in components)
}

