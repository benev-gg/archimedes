
import {makeId} from "./make-id.js"
import {Assign, Components, Delta, Id, Kind, Update} from "../types.js"

export function create<C extends Components>(components: Partial<C>): Assign {
	return [makeId(), Kind.Assign, components]
}

export function assign<C extends Components>(id: Id, components: undefined | Partial<C>): Assign {
	return [id, Kind.Assign, components]
}

export function del(id: Id): Assign {
	return [id, Kind.Assign]
}

export function update<C extends Components>(id: Id, delta: Delta<C>): Update {
	return [id, Kind.Update, delta]
}

