
import {Scheme} from "./schema/types.js"
import {Id128} from "./utils/id128.js"

export type JsonId = number
export type EntityId = number
export type DataOffset = number

export type Stores = {
	json: Map<Id128, any>
	blob: Map<Id128, Uint8Array>
}

export type Block = {
	name: string
	scheme: Scheme<any>
	buffer: Uint8Array
	next: number
	free: Set<number>
}

