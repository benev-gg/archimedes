
import {makeId} from "../parts/make-id.js"
import {Namecoder} from "../utils/namecoder.js"
import {Block, Change, Store} from "./types.js"
import {Components, FixedComponent} from "../types.js"
import {isFixedComponent} from "../utils/is-component.js"
import {sortComponents} from "../utils/sort-components.js"

export function makeStore(
		components: Components,
		changed: (change: Change) => void = (change: Change) => void change,
	): Store {

	const entries = sortComponents(components)
	const sortedNames = entries.map(([n]) => n)
	const sortedComponents = entries.map(([,c]) => c)

	return {
		version: makeId(...entries.flatMap(([name, c]) => [name, c.version])),
		namecoder: new Namecoder(sortedNames),
		addresses: new Map(),
		beforeChange: changed,

		columns: sortedComponents.map(component => (
			isFixedComponent(component)
				? {component, block: makeBlock(component)}
				: {component, blobs: new Map()}
		)),
	}
}

export function makeBlock(component: FixedComponent): Block {
	return {stride: component.size, pages: [], nextSlot: 0, freeSlots: []}
}

