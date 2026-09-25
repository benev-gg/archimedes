
import type {Id} from "../types.js"
import type {Component, Components} from "../components/types.js"

export type EntityId = Id

export type EntityValue<C extends Component<any>> = (
	C extends Component<infer V>
		? V
		: never
)

export type Entity<C extends Components = any> = Readonly<{
	[K in keyof C]: EntityValue<C[K]>
}>

export type Selected<C extends Components, N extends keyof C> = (
	Pick<Entity<C>, N>
		& Partial<Entity<C>>
)

export type SelectedEntry<C extends Components, N extends keyof C> = (
	[id: EntityId, values: Selected<C, N>]
)

export type Patch<C extends Components> = {
	[K in keyof C]?: Entity<C>[K] | undefined
}

