
export type BlobId = string
export type EntityId = string
export type ComponentCode = number

export type FixedComponent<Value> = {
	size: number
	write: (bytes: Uint8Array, value: Value) => void
	read: (bytes: Uint8Array) => Value
}

export type VariableComponent<Value> = {
	encode: (value: Value) => Uint8Array
	decode: (bytes: Uint8Array) => Value
}

export type Component<Value> =
	| FixedComponent<Value>
	| VariableComponent<Value>

export type DiscriminateComponent<V, C extends Component<V>> = (
	C extends FixedComponent<V>
		? FixedComponent<V>
		: VariableComponent<V>
)

export type Components = {[key: string]: Component<any>}

export const asComponent = <V, C extends Component<V> = Component<V>>(c: C) => <DiscriminateComponent<V, C>>c
export const asComponents = <C extends Components>(c: C) => c

export type ComponentValue<C extends Component<any>> = (
	C extends Component<infer V>
		? V
		: never
)

export type ComponentValues<C extends Components> = {
	[K in keyof C]: ComponentValue<C[K]>
}

export type Json =
	| null
	| boolean
	| number
	| string
	| Json[]
	| {[key: string]: Json}

