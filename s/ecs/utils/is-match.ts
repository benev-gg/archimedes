
import {Components} from "../parts/types.js"

export function isMatch(set: Set<any>, components: Components) {
	return [...set].every(key => key in components)
}

