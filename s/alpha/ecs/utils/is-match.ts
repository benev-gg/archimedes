
import {Components} from "../types.js"

export function isMatch<C extends Components>(set: Set<keyof C>, components: Partial<C>) {
	return [...set].every(key => key in components)
}

