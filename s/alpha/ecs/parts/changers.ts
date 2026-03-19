
import {makeId} from "./make-id.js"
import {Change, Components, Id} from "../types.js"

export function create(components: Partial<Components>): Change {
	return [makeId(), components]
}

export function update(id: Id, components: Partial<Components>): Change {
	return [id, components]
}

export function del(id: Id): Change {
	return [id]
}

