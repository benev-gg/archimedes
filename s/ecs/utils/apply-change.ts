
import {GMap, is} from "@e280/stz"
import {Assign, Change, Components, Entities, Kind, Update} from "../parts/types.js"

export function applyChange<C extends Components>(entities: Entities<any>, change: Change) {
	switch (change[1]) {
		case Kind.Assign: return assign<C>(entities, <Assign>change)
		case Kind.Update: return update<C>(entities, <Update>change)
		default: throw new Error(`unknown change kind "${change[1]}"`)
	}
}

function assign<C extends Components>(entities: Entities<Partial<C>>, [id, _kind, components]: Assign) {
	if (components) {
		entities.set(id, components as Partial<C>)
		return components as Partial<C>
	}
	else {
		entities.delete(id)
		return undefined
	}
}

function update<C extends Components>(entities: Entities<Partial<C>>, [id, _kind, fresh]: Update) {
	const components = GMap.guarantee(entities, id, () => ({})) as any
	for (const [key, value] of Object.entries(fresh)) {
		if (!is.happy(value)) delete components[key]
		else components[key] = value
	}
	return components as Partial<C>
}

