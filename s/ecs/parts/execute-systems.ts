
import {Change} from "./change.js"
import {Entities} from "./entities.js"
import {applyDelta} from "./apply-delta.js"
import {Delta, Components, System} from "./types.js"

export function executeSystems<C extends Components>(entities: Entities<C>, systems: System<C>[]) {
	const entitiesReadonly = entities.readonly()
	const deltas: Delta<C>[] = []

	const change = new Change<C>(delta => {
		applyDelta(entities, delta)
		deltas.push(delta)
	})

	for (const system of systems)
		system(entitiesReadonly, change)

	return deltas
}

