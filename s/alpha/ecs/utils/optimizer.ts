
import {GMap} from "@e280/stz"
import {isMatch} from "./is-match.js"
import {Components, Entities, Id} from "../types.js"

export class Optimizer<C extends Components> {
	#index = new GMap<Set<keyof C>, Entities<C>>()

	constructor(public entities: Entities<C>) {}

	obtain(componentKeys: (keyof C)[]) {
		for (const set of this.#index.keys()) {
			if (set.size !== componentKeys.length) continue
			if (componentKeys.every(key => set.has(key)))
				return this.#index.require(set)
		}
		const set = new Set(componentKeys)
		const ents: Entities<C> = new GMap()
		this.#index.set(set, ents)
		for (const [id, components] of this.entities)
			if (isMatch(set, components))
				ents.set(id, components)
		return ents
	}

	update(id: Id, components: Partial<C>) {
		for (const [set, ents] of this.#index) {
			if (isMatch(set, components)) ents.set(id, components)
			else ents.delete(id)
		}
	}

	eliminate(id: Id) {
		for (const ents of this.#index.values())
			ents.delete(id)
	}
}

