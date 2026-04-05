
import {Entities} from "./entities.js"
import {ChangeSet, Change, Components, ChangeKind, ChangeMerge, ChangeDrop} from "./types.js"

export function applyChange<C extends Components>(entities: Entities<C>, change: Change<C>) {
	switch (change[0]) {
		case ChangeKind.Set: return applySet<C>(entities, <ChangeSet<C>>change)
		case ChangeKind.Merge: return applyMerge<C>(entities, <ChangeMerge<C>>change)
		case ChangeKind.Drop: return applyDrop<C>(entities, <ChangeDrop<C>>change)
		default: throw new Error(`unknown change kind "${change[0]}"`)
	}
}

function applySet<C extends Components>(entities: Entities<C>, [, id, components]: ChangeSet<C>) {
	if (components) entities.set(id, components as Partial<C>)
	else entities.delete(id)
	return id
}

function applyMerge<C extends Components>(entities: Entities<C>, [, id, patch]: ChangeMerge<C>) {
	const components = entities.get(id)
	if (!components)
		return id
	Object.assign(components, patch)
	entities.set(id, components)
	return id
}

function applyDrop<C extends Components>(entities: Entities<C>, [, id, keys]: ChangeDrop<C>) {
	const components = entities.get(id)
	if (!components)
		return id
	for (const key of keys) delete components[key]
	entities.set(id, components)
	return id
}
