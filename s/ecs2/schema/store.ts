
import {hex, need} from "@e280/stz"
import {asScheme} from "./types.js"
import {id128, Id128} from "../utils/id128.js"

export function makeStoreScheme<X>(store: Map<Id128, X>) {
	return asScheme<X>({
		size: 16,

		write: (b, x) => {
			const id = id128()
			store.set(id, x)
			b.set(hex.toBytes(id))
		},

		read: b => {
			const id = hex.fromBytes(b)
			return need(store, id)
		},

		dispose: b => {
			const id = hex.fromBytes(b)
			store.delete(id)
		},
	})
}

