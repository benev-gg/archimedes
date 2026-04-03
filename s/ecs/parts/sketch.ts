
import {GMap} from "@e280/stz"
import {Optimizer} from "./optimizer.js"
import {applyChange} from "../utils/apply-change.js"
import {Change, Components, Id, LifecycleCallbacks, LifecycleEnter, Select, System} from "./types.js"

export class Viewer<C extends Components> {
	#optimizer

	constructor(optimizer: Optimizer<C>) {
		this.#optimizer = optimizer
	}

	require<C2 extends Partial<C> = Partial<C>>(id: Id) {
		return GMap.require(this.#optimizer.entities, id) as C2 & Partial<C>
	}

	*select<K extends keyof C>(...required: K[]) {
		for (const entity of this.#optimizer.obtain(required)) {
			const [,components] = entity
			if (required.every(r => r in components))
				yield entity as [id: Id, components: Select<C, K>]
		}
	}
}

export class Manipulator<C extends Components> {
	#optimizer

	constructor(optimizer: Optimizer<C>) {
		this.#optimizer = optimizer
	}

	apply(change: Change) {
		const [id] = change
		const components = applyChange<C>(this.#optimizer.entities, change)
		if (components) this.#optimizer.update(id, components)
		else this.#optimizer.eliminate(id)
		return id
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

export function lifecycle<C extends Components, K extends keyof C>(viewer: Viewer<C>, required: K[], enter: LifecycleEnter<C, K>) {
	const alive = new GMap<Id, LifecycleCallbacks<C, K>>()
	const sel = () => viewer.select(...required)

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

