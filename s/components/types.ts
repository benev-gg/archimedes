
import type {Id} from "../types.js"

export type FixedComponent<Value = any> = Readonly<{
	version: Id
	size: number
	write: (bytes: Uint8Array, value: Value) => void
	read: (bytes: Uint8Array) => Value
}>

export type VariableComponent<Value = any> = Readonly<{
	version: Id
	encode: (value: Value) => Uint8Array
	decode: (bytes: Uint8Array) => Value
}>

export type Component<Value = any> =
	| FixedComponent<Value>
	| VariableComponent<Value>

export type Components = {[key: string]: Component<any>}

export function asComponent<V>(c: FixedComponent<V>): FixedComponent<V>
export function asComponent<V>(c: VariableComponent<V>): VariableComponent<V>
export function asComponent<V>(c: Component<V>): Component<V> {
	return Object.freeze(c)
}

export const asComponents = <C extends Components>(c: C) => Object.freeze(c)

