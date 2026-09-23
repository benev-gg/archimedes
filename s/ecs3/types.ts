
export type Id = string
export type EntityId = Id
export type EntityEntry<Values> = [id: EntityId, values: Values]

export type FixedComponent<Value = any> = {
	version: Id
	size: number
	write: (bytes: Uint8Array, value: Value) => void
	read: (bytes: Uint8Array) => Value
}

export type VariableComponent<Value = any> = {
	version: Id
	encode: (value: Value) => Uint8Array
	decode: (bytes: Uint8Array) => Value
}

export type Component<Value = any> =
	| FixedComponent<Value>
	| VariableComponent<Value>

export type Components = {[key: string]: Component<any>}

export const asComponent = <V>(c: Component<V>) => c
export const asComponents = <C extends Components>(c: C) => c

export type ComponentValue<C extends Component<any>> = (
	C extends Component<infer V>
		? V
		: never
)

export type ComponentValues<C extends Components> = Readonly<{
	[K in keyof C]: ComponentValue<C[K]>
}>

export type Selected<C extends Components, N extends keyof C> = (
	Pick<ComponentValues<C>, N>
		& Partial<ComponentValues<C>>
)

export type SelectedEntry<C extends Components, N extends keyof C> = (
	[id: EntityId, values: Selected<C, N>]
)

export type Patch<C extends Components> = {
	[K in keyof C]?: ComponentValues<C>[K] | undefined
}

export type Json =
	| null
	| boolean
	| number
	| string
	| Json[]
	| {[key: string]: Json}

