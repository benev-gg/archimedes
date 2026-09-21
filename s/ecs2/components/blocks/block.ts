
import {Component} from "../types.js"
import {BlockSlot} from "./block-slot.js"

export class Block {
	#pages: Uint8Array[] = []
	#nextSlot = 0
	#freeSlots = new Set<number>()

	constructor(
		public readonly name: string,
		public readonly component: Component<any>,
		public readonly slotsPerPage = 1024,
	) {}

	slot() {
		const address = this.#allocate()
		const bytes = this.#bytes(address)
		const free = () => this.#free(address)
		return new BlockSlot(this.component, bytes, free)
	}

	#bytes(address: number) {
		const {size} = this.component
		const pageIndex = Math.floor(address / this.slotsPerPage)
		const slotIndex = address % this.slotsPerPage

		const page = this.#pages[pageIndex]!
		const offset = slotIndex * size
		return page.subarray(offset, offset + size)
	}

	#allocate() {
		const available = this.#freeSlots.values().next()

		if (!available.done) {
			this.#freeSlots.delete(available.value)
			return available.value
		}

		const address = this.#nextSlot++
		const pageIndex = Math.floor(address / this.slotsPerPage)

		if (!this.#pages[pageIndex])
			this.#pages.push(
				new Uint8Array(this.slotsPerPage * this.component.size)
			)

		return address
	}

	#free(address: number) {
		this.#freeSlots.add(address)
	}
}

