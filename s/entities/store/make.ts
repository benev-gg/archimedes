
import {Block, Store} from "./types.js"
import {makeId} from "../make-id.js"
import {Namecoder} from "../utils/namecoder.js"
import {isFixedComponent} from "../utils/is-component.js"
import {sortComponents} from "../utils/sort-components.js"
import {Components, FixedComponent} from "../../components/types.js"

export function makeStore(components: Components): Store {
	const entries = sortComponents(components)
	const sortedNames = entries.map(([n]) => n)
	const sortedComponents = entries.map(([,c]) => c)

	return {
		version: makeId(...entries.flatMap(([name, c]) => [name, c.version])),
		namecoder: new Namecoder(sortedNames),
		addresses: new Map(),
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

