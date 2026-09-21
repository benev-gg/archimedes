import { hex, need } from "@e280/stz"
import { id128, Id128 } from "./utils/id128.js"

export type Schema<Value> = {
	size: number
	read(bytes: Uint8Array): Value
	write(bytes: Uint8Array, value: Value): void
	delete(bytes: Uint8Array): void
}

export type Schematic = Record<string, Schema<any>>

export const asSchema = <X>(s: Schema<X>) => s
export const asSchematic = <S extends Schematic>(s: S) => s

export type SchemaValue<S> = S extends Schema<infer X>
	? X
	: never

export type SchematicValues<S extends Schematic> = {
	[K in keyof S]: SchemaValue<S[K]>
}

/////////////

export const u8 = asSchema<number>({
	size: 1,
	write: (bytes, x) => bytes[0] = x,
	read: bytes => bytes[0]!,
	delete: () => {},
})

export function makeStoreSchema<X>(store: Map<Id128, X>) {
	return asSchema<X>({
		size: 16,

		write: (bytes, x) => {
			store.delete(hex.fromBytes(bytes)) // ensure previous is disposed
			const id = id128()
			store.set(id, x)
			bytes.set(hex.toBytes(id))
		},

		read: bytes => {
			const id = hex.fromBytes(bytes)
			return need(store, id)
		},

		delete: bytes => {
			const id = hex.fromBytes(bytes)
			store.delete(id)
		},
	})
}

// export const u8 = asScheme<number>({
// 	size: 1,
// 	write: (b, x) => b.set([x]),
// 	read: b => b[0]!,
// })
