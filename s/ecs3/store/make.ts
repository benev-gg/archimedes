
import {Store} from "./types.js"
import {Components} from "../types.js"

export function makeStore(components: Components) {
	const store: Store = {
		codes: {},
		components: [],
		blocks: [],
		blobs: [],
		records: new Map(),
	}

	for (const [code, [name, component]] of Object.entries(components).entries()) {
		store.codes[name] = code
		store.components.push(component)
		store.blocks.push({pages: [], nextSlot: 0, freeSlots: []})
		store.blobs.push(new Map())
	}

	return store
}

