
import {Optimizer} from "../utils/optimizer.js"
import {Change, Components, Entities, Id, Select, System} from "../types.js"

export class World<C extends Components> {
	#optimizer

	constructor(public entities: Entities<C> = new Map()) {
		this.#optimizer = new Optimizer<C>(entities)
	}

	select = function*<K extends keyof C>(this: World<C>, ...required: K[]) {
		for (const entity of this.#optimizer.obtain(required)) {
			const [,components] = entity
			if (required.every(r => r in components))
				yield entity as [id: Id, components: Select<C, K>]
		}
	}.bind(this)

	apply = ([id, components]: Change) => {
		if (components) {
			this.entities.set(id, components as Partial<C>)
			this.#optimizer.update(id, components as Partial<C>)
		}
		else {
			this.entities.delete(id)
			this.#optimizer.eliminate(id)
		}
	}

	execute = (systems: System[]) => {
		return systems.flatMap(system => {
			const changes = [...system()]
			for (const change of changes) this.apply(change)
			return changes
		})
	}
}

