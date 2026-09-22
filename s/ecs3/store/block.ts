
import {Block, Slot} from "./types.js"
import {slotsPerPage} from "../utils/consts.js"

export function blockAllocate(block: Block): Slot {
	const recycled = block.freeSlots.pop()
	if (recycled !== undefined) return recycled
	const slot = block.nextSlot++
	const pageIndex = Math.floor(slot / slotsPerPage)
	block.pages[pageIndex] ??=
		new Uint8Array(slotsPerPage * block.stride)
	return slot
}

export function blockFree(block: Block, slot: Slot) {
	block.freeSlots.push(slot)
}

export function blockGetBytes(block: Block, slot: number) {
	const pageIndex = Math.floor(slot / slotsPerPage)
	const slotIndex = slot % slotsPerPage
	const page = block.pages[pageIndex]
	const offset = slotIndex * block.stride
	return page.subarray(offset, offset + block.stride)
}

