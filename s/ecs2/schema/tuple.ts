
import {Scheme, Value} from "./types.js"

type TupleValues<S extends readonly Scheme<any>[]> = {
	[K in keyof S]: Value<S[K]>
}

export function tuple<const S extends readonly Scheme<any>[]>(
		...schemes: S
	): Scheme<TupleValues<S>> {

	const offsets: number[] = []
	let size = 0

	for (const scheme of schemes) {
		offsets.push(size)
		size += scheme.size
	}

	return {
		size,

		write: (bytes, values) => {
			for (let i = 0; i < schemes.length; i++) {
				const scheme = schemes[i]!
				const offset = offsets[i]!

				const slice = bytes.subarray(
					offset,
					offset + scheme.size,
				)

				scheme.write(values[i], slice)
			}
		},

		read: bytes => schemes.map((scheme, i) => {
			const offset = offsets[i]!
			return scheme.read(
				bytes.subarray(
					offset,
					offset + scheme.size,
				),
			)
		}) as TupleValues<S>,
	}
}

