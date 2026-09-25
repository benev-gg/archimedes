
import {Id} from "../../types.js"

export function isId(id: string): this is Id {
	return (id.length === 32)
}

export function assertIdIsValid(id: string) {
	if (isId(id)) return id
	else throw new Error("invalid id")
}

