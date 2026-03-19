
import {GMap} from "@e280/stz"
import {Optimizer} from "../utils/optimizer.js"
import {Change, Components, Entities, Id, LifecycleCallbacks, LifecycleEnter, Select, System} from "../types.js"

export class World<C extends Components> {
	#optimizer

	constructor(public entities: Entities<Partial<C>> = new Map()) {
		this.#optimizer = new Optimizer<C>(entities)
	}

	*select<K extends keyof C>(...required: K[]) {
		for (const entity of this.#optimizer.obtain(required)) {
			const [,components] = entity
			if (required.every(r => r in components))
				yield entity as [id: Id, components: Select<C, K>]
		}
	}

	lifecycle<K extends keyof C>(required: K[], enter: LifecycleEnter<C, K>) {
		const alive = new GMap<Id, LifecycleCallbacks<C, K>>()
		const sel = () => this.select(...required)

		return function*() {
			const current = new Map(sel())

			for (const [id, callbacks] of alive) {
				if (current.has(id)) continue
				alive.delete(id)
				callbacks.exit(id)
			}

			for (const [id, components] of current) {
				const callbacks = alive.guarantee(id, () => enter(id, components))
				callbacks.tick(id, components)
			}
		}
	}

	apply([id, components]: Change) {
		if (components) {
			this.entities.set(id, components as Partial<C>)
			this.#optimizer.update(id, components as Partial<C>)
		}
		else {
			this.entities.delete(id)
			this.#optimizer.eliminate(id)
		}
	}

	execute(systems: System[]) {
		const changes: Change[] = []
		for (const system of systems) {
			for (const change of system()) {
				this.apply(change)
				changes.push(change)
			}
		}
		return changes
	}
}

