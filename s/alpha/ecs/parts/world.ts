
import {makeId} from "../utils/id.js"
import {makeOptimizer} from "./optimizer.js"
import {Change, Components, Entities, Id, Select, System, World} from "../types.js"

export function makeWorld<C extends Components>(entities: Entities<C> = new Map()): World<C> {
	const optimizer = makeOptimizer<C>(entities)

	function *select<K extends keyof C>(...required: K[]) {
		for (const entity of optimizer.obtain(required)) {
			const [,components] = entity
			if (required.every(r => r in components))
				yield entity as [id: Id, components: Select<C, K>]
		}
	}

	function apply([id, components]: Change) {
		if (components) {
			entities.set(id, components as Partial<C>)
			optimizer.update(id, components as Partial<C>)
		}
		else {
			entities.delete(id)
			optimizer.eliminate(id)
		}
	}

	function execute(systems: System[]) {
		return systems.flatMap(system => {
			const changes = [...system()]
			for (const change of changes) apply(change)
			return changes
		})
	}

	function create(components: Partial<C>): Change {
		return [makeId(), components]
	}

	function update(id: Id, components: Partial<C>): Change {
		return [id, components]
	}

	function del(id: Id): Change {
		return [id]
	}

	return {entities, select, apply, execute, create, update, del}
}

