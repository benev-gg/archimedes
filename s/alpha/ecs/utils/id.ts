
import {hex} from "@e280/stz"

export function makeId() {
	return hex.random(8)
}

