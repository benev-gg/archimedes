
import {makeId} from "./make-id.js"
import {Change, Components, Id} from "../types.js"

export function create<C extends Components>(components: Partial<C>): Change {
	return [makeId(), components]
}

export function update<C extends Components>(id: Id, components: Partial<C>): Change {
	return [id, components]
}

export function del(id: Id): Change {
	return [id]
}

