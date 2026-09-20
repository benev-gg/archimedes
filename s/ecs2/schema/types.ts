
export type Scheme<X> = {
	size: number
	write: (bytes: Uint8Array) => (value: X) => void
	read: (bytes: Uint8Array) => () => X
}

export type Schema = Record<string, Scheme<any>>
export type Value<S> = S extends Scheme<infer V> ? V : never

export const asScheme = <X>(s: Scheme<X>) => s
export const asSchema = <S extends Schema>(s: S) => s

export type Components<S extends Schema> = {
	[K in keyof S]: Value<S[K]>
}

