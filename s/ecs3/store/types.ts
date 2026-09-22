
import {Component, ComponentCode, EntityId} from "../types.js"

export type Store = {
	codes: Record<string, ComponentCode>
	components: Component<any>[]
	blocks: Block[]
	blobs: Map<EntityId, Uint8Array>[]
	records: Map<EntityId, Map<ComponentCode, Address>>
	onDelta: OnDelta
}

export type Block = {
	pages: Uint8Array[]
	nextSlot: number
	freeSlots: number[]
}

export type Address =
	| {slot: number}
	| {blob: true}

export type Delta = (
	| {kind: "write", entityId: EntityId, componentCode: ComponentCode, bytes: Uint8Array}
	| {kind: "free", entityId: EntityId, componentCode: ComponentCode}
)

export type OnDelta = (delta: Delta) => void

