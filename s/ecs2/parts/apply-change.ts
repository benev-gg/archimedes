
import {is} from "@e280/stz"
import {Entities} from "./entities.js"
import {ChangeAssign, Change, Components, ChangeKind, ChangePatch} from "./types.js"

export function applyChange<C extends Components>(entities: Entities<C>, change: Change) {
	switch (change[0]) {
		case ChangeKind.Assign: return assign<C>(entities, <ChangeAssign>change)
		case ChangeKind.Patch: return update<C>(entities, <ChangePatch>change)
		default: throw new Error(`unknown change kind "${change[0]}"`)
	}
}

function assign<C extends Components>(entities: Entities<C>, [, id, components]: ChangeAssign) {
	if (components) {
		entities.set(id, components as Partial<C>)
		return components as Partial<C>
	}
	else {
		entities.delete(id)
		return undefined
	}
}

function update<C extends Components>(entities: Entities<Partial<C>>, [, id, fresh]: ChangePatch) {
	const components = entities.guarantee(id, () => ({})) as any
	for (const [key, value] of Object.entries(fresh)) {
		if (!is.happy(value)) delete components[key]
		else components[key] = value
	}
	return components as Partial<C>
}

