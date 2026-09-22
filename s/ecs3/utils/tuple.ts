
import {endian} from "./consts.js"
import {dataView} from "./data-view.js"
import {asComponent, Component, ComponentValue, FixedComponent} from "../types.js"

type TupleValues<C extends Component<any>[]> = {
	[K in keyof C]: ComponentValue<C[K]>
}

export function tuple<const C extends Component<any>[]>(
	...components: C
): Component<TupleValues<C>> {
	const all_fixed = components.every(component => "size" in component)

	if (all_fixed) {
		const fixed = components as any as FixedComponent<any>[]
		const size = fixed.reduce((total, component) => total + component.size, 0)

		return asComponent<TupleValues<C>>({
			size,

			write(bytes, values) {
				let offset = 0

				for (let i = 0; i < fixed.length; i++) {
					const component = fixed[i]!
					const end = offset + component.size

					component.write(
						bytes.subarray(offset, end),
						values[i],
					)

					offset = end
				}
			},

			read(bytes) {
				let offset = 0
				const values: unknown[] = []

				for (const component of fixed) {
					const end = offset + component.size

					values.push(
						component.read(bytes.subarray(offset, end)),
					)

					offset = end
				}

				return values as TupleValues<C>
			},
		})
	}

	return asComponent<TupleValues<C>>({
		encode(values) {
			const parts: Uint8Array[] = []

			for (let i = 0; i < components.length; i++) {
				const component = components[i]!
				const value = values[i]

				if ("size" in component) {
					const bytes = new Uint8Array(component.size)
					component.write(bytes, value)
					parts.push(bytes)
				}
				else {
					const payload = component.encode(value)
					const bytes = new Uint8Array(4 + payload.length)

					dataView(bytes).setUint32(0, payload.length, endian)
					bytes.set(payload, 4)

					parts.push(bytes)
				}
			}

			const total = parts.reduce((sum, part) => sum + part.length, 0)
			const bytes = new Uint8Array(total)

			let offset = 0
			for (const part of parts) {
				bytes.set(part, offset)
				offset += part.length
			}

			return bytes
		},

		decode(bytes) {
			let offset = 0
			const values: unknown[] = []

			for (const component of components) {
				if ("size" in component) {
					const end = offset + component.size

					values.push(
						component.read(bytes.subarray(offset, end)),
					)

					offset = end
				}
				else {
					const length = dataView(bytes.subarray(offset, offset + 4))
						.getUint32(0, endian)

					offset += 4

					const end = offset + length

					values.push(
						component.decode(bytes.subarray(offset, end)),
					)

					offset = end
				}
			}

			return values as TupleValues<C>
		},
	})
}

