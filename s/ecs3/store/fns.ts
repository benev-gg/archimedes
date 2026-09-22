
import {need} from "@e280/stz"
import {slotsPerPage} from "../utils/consts.js"
import {Block, Column, Code, Slot, Store} from "./types.js"
import {Component, EntityId, FixedComponent, VariableComponent} from "../types.js"

export function isFixedComponent<Value>(component: Component<Value>): component is FixedComponent<Value> {
	return "size" in component
}

export function isVariableComponent<Value>(component: Component<Value>): component is VariableComponent<Value> {
	return !("size" in component)
}

export function makeBlock(component: FixedComponent): Block {
	return {stride: component.size, pages: [], nextSlot: 0, freeSlots: []}
}

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

export function columnGetBytes(column: Column, id: EntityId, slot: Slot | null) {
	if (slot === null) {
		if (!("blobs" in column)) throw new Error("bad column type")
		return need(column.blobs, id)
	}
	else {
		if (!("block" in column)) throw new Error("bad column type")
		return blockGetBytes(column.block, slot)
	}
}

export function columnGetValue(column: Column, id: EntityId, slot: Slot | null) {
	const bytes = columnGetBytes(column, id, slot)
	return ("block" in column)
		? column.component.read(bytes)
		: column.component.decode(bytes)
}

export function storeGetBytes(store: Store, id: EntityId, code: Code) {
	const addresses = need(store.addresses, id)
	const slot = need(addresses, code)
	const column = store.columns[code]
	return columnGetBytes(column, id, slot)
}

export function storeGetValue(store: Store, id: EntityId, code: Code) {
	const addresses = need(store.addresses, id)
	const slot = need(addresses, code)
	const column = store.columns[code]
	return columnGetValue(column, id, slot)
}

export function storeGetValues(store: Store, id: EntityId) {
	const addresses = store.addresses.get(id)
	if (!addresses) return undefined
	const values = {} as Record<string, any>
	for (const code of addresses.keys()) {
		const name = store.namecoder.name(code)
		const value = storeGetValue(store, id, code)
		values[name] = value
	}
	return values
}

export function storeHasEntity(store: Store, id: EntityId) {
	return store.addresses.has(id)
}

export function storeCreateEntity(store: Store, id: EntityId) {
	if (store.addresses.has(id)) return false
	store.changed([id])
	store.addresses.set(id, new Map())
	return true
}

export function storeWriteValue(
		store: Store,
		id: EntityId,
		code: Code,
		value: any,
	) {

	const addresses = need(store.addresses, id)
	const column = store.columns[code]

	const exists = addresses.has(code)
	const previousSlot = addresses.get(code)

	if ("block" in column) {
		if (exists && previousSlot === null)
			throw new Error("bad column address")

		// Important: observer sees the OLD state.
		store.changed([id, code])

		const slot = exists
			? previousSlot!
			: blockAllocate(column.block)

		column.component.write(
			blockGetBytes(column.block, slot),
			value,
		)

		if (!exists)
			addresses.set(code, slot)
	}
	else {
		if (exists && previousSlot !== null)
			throw new Error("bad column address")

		// Encode first — if the codec throws, nothing has been touched.
		const bytes = column.component.encode(value)

		store.changed([id, code])
		column.blobs.set(id, bytes)

		if (!exists)
			addresses.set(code, null)
	}
}

export function storeDeleteValue(
	store: Store,
	id: EntityId,
	code: Code,
) {
	const addresses = store.addresses.get(id)
	if (!addresses)
		return false

	if (!addresses.has(code))
		return false

	const slot = addresses.get(code)!
	const column = store.columns[code]

	// Rollback observers can still inspect the old bytes here.
	store.changed([id, code])

	if ("block" in column) {
		if (slot === null)
			throw new Error("bad column address")

		addresses.delete(code)
		blockFree(column.block, slot)
	}
	else {
		if (slot !== null)
			throw new Error("bad column address")

		addresses.delete(code)
		column.blobs.delete(id)
	}

	return true
}

export function storeDeleteEntity(store: Store, id: EntityId) {
	const addresses = store.addresses.get(id)
	if (!addresses) return false
	for (const code of [...addresses.keys()])
		storeDeleteValue(store, id, code)
	store.changed([id])
	store.addresses.delete(id)
	return true
}

