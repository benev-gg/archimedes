
import {Components} from "../types.js"
import {Change, Store} from "./types.js"
import {Namecoder} from "../utils/namecoder.js"
import {isFixedComponent, makeBlock} from "./fns.js"

export function makeStore(
		components: Components,
		changed = (change: Change) => void change,
	): Store {

	return {
		namecoder: new Namecoder(components),
		addresses: new Map(),
		changed,

		columns: Object.values(components).map(component => (
			isFixedComponent(component)
				? {component, block: makeBlock(component)}
				: {component, blobs: new Map()}
		)),
	}
}

