
import {World} from "./world.js"
import {Entity} from "./entity.js"

export type Components = Record<string, any>
export type EntityId = number

export type EntityData<C extends Components = any> = [EntityId, UnknownComponents<C> | null]
export type UnknownComponents<C extends Components = any> = Partial<C>
export type SpecificComponents<C extends Components, K extends keyof C> = {[X in K]: C[X]}

export type FancySelect<C extends Components, K extends keyof C, K2 extends (keyof C) | undefined> = (
	K2 extends keyof C
		? Entity<SpecificComponents<C, K> & Partial<SpecificComponents<C, K2>>>
		: Entity<SpecificComponents<C, K>>
)

export type SystemFn<Context, C extends Components, K extends keyof C, K2 extends (keyof C) | undefined> = (
	(entities: FancySelect<C, K, K2>[], world: World<Context, C>) => void
)

