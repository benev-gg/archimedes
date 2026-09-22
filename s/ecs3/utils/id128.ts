
import {bytes, hex} from "@e280/stz"
import {hash} from "./hash.js"

export type Id128 = string

export function id128(...entropy: (string | number | Uint8Array)[]): Id128 {
	return (entropy.length === 0)
		? hex(bytes.random(16))
		: hex(hash(...entropy).slice(0, 16))
}

