
import {Components} from "../types.js"
import {OnDelta, Store} from "./types.js"

export function makeStore(components: Components, onDelta: OnDelta = () => {}) {
	const store: Store = {
		codes: {},
		components: [],
		blocks: [],
		blobs: [],
		records: new Map(),
		onDelta,
	}

	for (const [code, [name, component]] of Object.entries(components).entries()) {
		store.codes[name] = code
		store.components.push(component)
		store.blocks.push({pages: [], nextSlot: 0, freeSlots: []})
		store.blobs.push(new Map())
	}

	return store
}

