
import {hex, need} from "@e280/stz"
import {asComponent} from "./types.js"
import {id128, Id128} from "../utils/id128.js"

export function makeStoreComponent<X>(store: Map<Id128, X>) {
	return asComponent<X>({
		size: 16,

		write: (bytes, x) => {
			store.delete(hex.fromBytes(bytes)) // ensure previous is disposed
			const id = id128()
			store.set(id, x)
			bytes.set(hex.toBytes(id))
		},

		read: bytes => {
			const id = hex.fromBytes(bytes)
			return need(store, id)
		},

		delete: bytes => {
			const id = hex.fromBytes(bytes)
			store.delete(id)
		},
	})
}

