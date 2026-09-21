
import {Id128} from "./utils/id128.js"
import {Components} from "./components/types.js"
import {FancyComponents} from "./components/fancy.js"

export type JsonId = number
export type EntityId = number
export type DataOffset = number

export type JsonMap = Map<Id128, any>
export type BlobMap = Map<Id128, Uint8Array>

export type FancyFn<C extends Components> = (fancy: FancyComponents) => C

