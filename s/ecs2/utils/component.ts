
import {Block, blockAllocate, blockBytes, blockFree} from "../schema/blocks.js"

export class Component {
	#block
	#address
	#bytes

	constructor(block: Block) {
		this.#block = block
		this.#address = blockAllocate(block)
		this.#bytes = blockBytes(this.#address)
	}

	write(value: unknown) {
		this.#block.scheme.write(this.#bytes, value)
	}

	read() {
		return this.#block.scheme.read(this.#bytes)
	}

	dispose() {
		blockFree(this.#address)
		this.#block.scheme.delete?.(this.#bytes)
	}
}

