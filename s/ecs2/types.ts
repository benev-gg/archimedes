
import {Id128} from "./utils/id128.js"

export type JsonId = number
export type EntityId = number
export type DataOffset = number

export type JsonStore = Map<Id128, any>
export type BlobStore = Map<Id128, Uint8Array>

