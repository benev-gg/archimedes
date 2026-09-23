
import {need} from "@e280/stz"
import {EntityId} from "../types.js"
import {Code, Store} from "./types.js"
import {columnGetBytes, columnGetValue} from "./column.js"
import {blockAllocate, blockFree, blockGetBytes} from "./block.js"

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

		const bytes = column.component.encode(value)
		column.blobs.set(id, bytes)

		if (!exists)
			addresses.set(code, null)
	}
}

export function storeWriteBytes(
		store: Store,
		id: EntityId,
		code: Code,
		bytes: Uint8Array,
	) {

	const addresses = need(store.addresses, id)
	const column = store.columns[code]!

	if ("block" in column) {
		if (bytes.length !== column.component.size)
			throw new RangeError("invalid fixed component size")

		const slot = blockAllocate(column.block)
		blockGetBytes(column.block, slot).set(bytes)
		addresses.set(code, slot)
	}
	else {
		column.blobs.set(id, new Uint8Array(bytes))
		addresses.set(code, null)
	}
}

export function storeDeleteValue(store: Store, id: EntityId, code: Code) {
	const addresses = store.addresses.get(id)
	if (!addresses)
		return false

	if (!addresses.has(code))
		return false

	const slot = addresses.get(code)!
	const column = store.columns[code]

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
	store.addresses.delete(id)
	return true
}

