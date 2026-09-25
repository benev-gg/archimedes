
import {makeId} from "./make-id.js"
import {endian} from "../utils/consts.js"
import {dataView} from "../utils/data-view.js"
import {isFixedComponent} from "../utils/is-component.js"
import {Component, EntityValue, FixedComponent, VariableComponent} from "../types.js"

type TupleValues<C extends Component[]> = {
	[K in keyof C]: EntityValue<C[K]>
}

export function tuple<const C extends FixedComponent[]>(
		...components: C
	): FixedComponent<TupleValues<C>> {

	if (components.length === 0)
		throw new RangeError("tuple requires at least one sub component")

	const version = makeId(...components.map(c => c.version))
	const size = components.reduce(
		(total, component) => total + component.size,
		0,
	)

	return {
		version,
		size,

		write(bytes, values) {
			let offset = 0

			for (let i = 0; i < components.length; i++) {
				const component = components[i]!
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

			for (const component of components) {
				const end = offset + component.size

				values.push(
					component.read(bytes.subarray(offset, end)),
				)

				offset = end
			}

			return values as TupleValues<C>
		},
	}
}

export function vtuple<const C extends Component[]>(
		...components: C
	): VariableComponent<TupleValues<C>> {

	if (components.length === 0)
		throw new RangeError("vtuple requires at least one sub component")

	const version = makeId(...components.map(c => c.version))

	return {
		version,

		encode(values) {
			const parts: Uint8Array[] = []

			for (let i = 0; i < components.length; i++) {
				const component = components[i]!
				const value = values[i]

				if (isFixedComponent(component)) {
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
				if (isFixedComponent(component)) {
					const end = offset + component.size

					values.push(
						component.read(bytes.subarray(offset, end)),
					)

					offset = end
				}
				else {
					const length = dataView(
						bytes.subarray(offset, offset + 4),
					).getUint32(0, endian)

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
	}
}

