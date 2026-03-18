
import {GMap} from "@e280/stz"
import {Components, Entities, Id} from "../types.js"

export function makeOptimizer<C extends Components>(entities: Entities<C>) {
	const index = new GMap<Set<keyof C>, Entities<C>>()

	function isMatch(set: Set<keyof C>, components: Partial<C>) {
		return [...set].every(key => key in components)
	}

	function obtain(componentKeys: (keyof C)[]) {
		for (const set of index.keys()) {
			if (set.size !== componentKeys.length) continue
			if (componentKeys.every(key => set.has(key)))
				return index.require(set)
		}
		const set = new Set(componentKeys)
		const ents: Entities<C> = new GMap()
		index.set(set, ents)
		for (const [id, components] of entities)
			if (isMatch(set, components))
				ents.set(id, components)
		return ents
	}

	function update(id: Id, components: Partial<C>) {
		for (const [set, ents] of index) {
			if (isMatch(set, components)) ents.set(id, components)
			else ents.delete(id)
		}
	}

	function eliminate(id: Id) {
		for (const ents of index.values())
			ents.delete(id)
	}

	return {obtain, update, eliminate}
}

