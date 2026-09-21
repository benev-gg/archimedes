
import {Component, ComponentValue} from "./types.js"

type TupleValues<S extends readonly Component<any>[]> = {
	[K in keyof S]: ComponentValue<S[K]>
}

export function tuple<const S extends readonly Component<any>[]>(
		...schemes: S
	): Component<TupleValues<S>> {

	const offsets: number[] = []
	let size = 0

	for (const scheme of schemes) {
		offsets.push(size)
		size += scheme.size
	}

	const slice = (bytes: Uint8Array, i: number) => {
		const scheme = schemes[i]!
		const offset = offsets[i]!
		return bytes.subarray(offset, offset + scheme.size)
	}

	return {
		size,

		write: (bytes, values) => {
			for (let i = 0; i < schemes.length; i++)
				schemes[i]!.write(slice(bytes, i), values[i])
		},

		read: bytes => schemes.map(
			(scheme, i) => scheme.read(slice(bytes, i))
		) as TupleValues<S>,

		delete: bytes => {
			for (let i = 0; i < schemes.length; i++)
				schemes[i]!.delete?.(slice(bytes, i))
		},
	}
}

