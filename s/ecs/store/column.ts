
import {need} from "@e280/stz"
import {EntityId} from "../types.js"
import {Column, Slot} from "./types.js"
import {blockGetBytes} from "./block.js"

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

