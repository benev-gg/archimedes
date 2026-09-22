
import {Id128} from "./utils/id128.js"

export type EntityId = Id128
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

export type Components = {[key: string]: Component<any>}

export const asComponent = <V>(c: Component<V>) => c
export const asComponents = <C extends Components>(c: C) => c

export type ComponentValue<C extends Component<any>> = (
	C extends Component<infer V>
		? V
		: never
)

export type ComponentValues<C extends Components> = {
	[K in keyof C]: ComponentValue<C[K]>
}

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

