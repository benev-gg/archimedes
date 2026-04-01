
import {Dispatch, InputDispatch, Schema} from "../types.js"

export function isInputDispatch<S extends Schema>(
		dispatch: Dispatch<S>
	): dispatch is InputDispatch<S["input"]> {
	const [kind] = dispatch
	return kind === "input"
}

