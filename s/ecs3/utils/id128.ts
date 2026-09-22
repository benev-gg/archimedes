
import {bytes, hex} from "@e280/stz"

export type Id128 = string

export function id128(): Id128 {
	return hex(bytes.random(16))
}

