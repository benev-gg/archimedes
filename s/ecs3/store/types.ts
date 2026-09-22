
import {Namecoder} from "../utils/namecoder.js"
import {EntityId, FixedComponent, VariableComponent} from "../types.js"

export type Code = number

export type Store = {
	namecoder: Namecoder
	columns: (BlockColumn | BlobColumn)[] // indexed by Code
	addresses: Map<EntityId, Map<Code, Slot | null>>
	beforeChange: (change: Change) => void
}

export type Column = BlockColumn | BlobColumn

export type BlockColumn = {
	component: FixedComponent
	block: Block
}

export type BlobColumn = {
	component: VariableComponent
	blobs: Map<EntityId, Uint8Array>
}

export type Block = {
	stride: number
	pages: Uint8Array[]
	nextSlot: Slot
	freeSlots: Slot[]
}

export type Slot = number

export enum ChangeKind {
	Entity,
	Component,
}

export type Change = [id: EntityId, code?: Code]

