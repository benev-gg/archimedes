
import {Namecoder} from "../utils/namecoder.js"
import {Id} from "../../types.js"
import {EntityId} from "../types.js"
import {FixedComponent, VariableComponent} from "../../components/types.js"

export type Code = number

export type Store = {
	version: Id
	namecoder: Namecoder
	columns: (BlockColumn | BlobColumn)[] // indexed by Code
	addresses: Map<EntityId, Map<Code, Slot | null>>
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

