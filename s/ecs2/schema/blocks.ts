
import {Schematic, Schema} from "./types.js"

export type BlockStore<S extends Schematic> = Map<keyof S, Block>

export type Block = {
	name: string
	scheme: Schema<any>
	buffer: Uint8Array
	next: number
	free: Set<number>
}

export type Address = {
	block: Block
	offset: number
}

export function blockBytes({block, offset}: Address) {
	const end = offset + block.scheme.size
	return block.buffer.subarray(offset, end)
}

export function blockAllocate(block: Block): Address {
	const available = block.free.values().next()

	if (!available.done) {
		const offset = available.value
		block.free.delete(offset)
		return {block, offset}
	}

	const offset = block.next
	const next = offset + block.scheme.size

	if (next > block.buffer.byteLength)
		throw new RangeError(`component block "${block.name}" is full`)

	block.next = next
	return {block, offset}
}

export function blockFree(address: Address) {
	const {block, offset} = address
	block.free.add(offset)
}

export function makeBlocks<S extends Schematic>(max: number, schema: S) {
	const blocks: BlockStore<S> = new Map()

	for (const [name, scheme] of Object.entries(schema)) {
		blocks.set(name, {
			name,
			scheme,
			buffer: new Uint8Array(max * scheme.size),
			next: 0,
			free: new Set(),
		})
	}

	return blocks
}

