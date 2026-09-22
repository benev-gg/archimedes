
import {Namecoder} from "../utils/namecoder.js"
import {Block, Change, Store} from "./types.js"
import {Components, FixedComponent} from "../types.js"
import {isFixedComponent} from "../utils/is-component.js"

export function makeStore(
		components: Components,
		changed: (change: Change) => void = (change: Change) => void change,
	): Store {

	return {
		namecoder: new Namecoder(components),
		addresses: new Map(),
		beforeChange: changed,

		columns: Object.values(components).map(component => (
			isFixedComponent(component)
				? {component, block: makeBlock(component)}
				: {component, blobs: new Map()}
		)),
	}
}

export function makeBlock(component: FixedComponent): Block {
	return {stride: component.size, pages: [], nextSlot: 0, freeSlots: []}
}

