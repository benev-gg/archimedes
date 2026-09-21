
import {Block} from "./block.js"
import {Components} from "../types.js"

export class Blocks<C extends Components> extends Map<keyof C, Block> {
	constructor(components: C) {
		super()
		for (const [name, component] of Object.entries(components))
			this.set(name, new Block(name, component))
	}
}

