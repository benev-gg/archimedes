
export type Schema<Value> = {
	size: number
	write: (bytes: Uint8Array, value: Value) => void
	read: (bytes: Uint8Array) => Value
	delete: (bytes: Uint8Array) => void
}

export type Schematic = Record<string, Schema<any>>

export const asSchema = <X>(s: Schema<X>) => s
export const asSchematic = <S extends Schematic>(s: S) => s

export type SchemaValue<S> = S extends Schema<infer V> ? V : never
export type SchematicValues<S extends Schematic> = {
	[K in keyof S]: SchemaValue<S[K]>
}

