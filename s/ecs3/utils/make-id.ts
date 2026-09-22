
import {bytes, hex} from "@e280/stz"
import {hash} from "./hash.js"
import {Id} from "../types.js"

export function makeId(...entropy: (string | number | Uint8Array)[]): Id {
	return (entropy.length === 0)
		? hex(bytes.random(16))
		: hex(hash(...entropy).slice(0, 16))
}

