
import {Block, blockAllocate, blockBytes, blockFree} from "../schema/blocks.js"

export class StoredComponent {
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
		this.#block.scheme.delete?.(this.#bytes)
		blockFree(this.#address)
	}
}

