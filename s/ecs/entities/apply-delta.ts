
import {Entities} from "./entities.js"
import {DeltaSet, Delta, Components, DeltaKind, DeltaMerge, DeltaDrop} from "../types.js"

export function applyDelta<C extends Components>(entities: Entities<C>, delta: Delta<C>) {
	switch (delta[0]) {
		case DeltaKind.Set: return applySet<C>(entities, <DeltaSet<C>>delta)
		case DeltaKind.Merge: return applyMerge<C>(entities, <DeltaMerge<C>>delta)
		case DeltaKind.Drop: return applyDrop<C>(entities, <DeltaDrop<C>>delta)
		default: throw new Error(`unknown delta kind "${delta[0]}"`)
	}
}

function applySet<C extends Components>(entities: Entities<C>, [, id, components]: DeltaSet<C>) {
	if (components) entities.set(id, components as Partial<C>)
	else entities.delete(id)
	return id
}

function applyMerge<C extends Components>(entities: Entities<C>, [, id, patch]: DeltaMerge<C>) {
	const components = entities.get(id)
	if (!components)
		return id
	Object.assign(components, patch)
	entities.set(id, components)
	return id
}

function applyDrop<C extends Components>(entities: Entities<C>, [, id, keys]: DeltaDrop<C>) {
	const components = entities.get(id)
	if (!components)
		return id
	for (const key of keys) delete components[key]
	entities.set(id, components)
	return id
}

