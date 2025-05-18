
import {Components, EntityId, EntityData} from "../parts/types.js"

export type InputEntry = [EntityId, unknown[]]
export type Delta<C extends Components> = EntityData<C>

export type EurekaSchema<C extends Components> = {
	state: EntityData<C>[]
	delta: Delta<C>[]
	input: InputEntry[]
}

