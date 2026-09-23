
import {tuple} from "./parts/tuple.js"
import {endian} from "./utils/consts.js"
import {asComponent, Json} from "./types.js"
import {dataView} from "./utils/data-view.js"

export const bool = asComponent<boolean>({
	size: 1,
	write: (bytes, value) => bytes[0] = value ?1 :0,
	read: bytes => (bytes[0]! !== 0),
})

export const u8 = asComponent<number>({
	size: 1,
	write: (bytes, x) => bytes[0] = x,
	read: bytes => bytes[0]!,
})

export const u16 = asComponent<number>({
	size: 2,
	write: (bytes, x) => dataView(bytes).setUint16(0, x, endian),
	read: bytes => dataView(bytes).getUint16(0, endian),
})

export const u32 = asComponent<number>({
	size: 4,
	write: (bytes, x) => dataView(bytes).setUint32(0, x, endian),
	read: bytes => dataView(bytes).getUint32(0, endian),
})

export const i8 = asComponent<number>({
	size: 1,
	write: (bytes, x) => dataView(bytes).setInt8(0, x),
	read: bytes => dataView(bytes).getInt8(0),
})

export const i16 = asComponent<number>({
	size: 2,
	write: (bytes, x) => dataView(bytes).setInt16(0, x, endian),
	read: bytes => dataView(bytes).getInt16(0, endian),
})

export const i32 = asComponent<number>({
	size: 4,
	write: (bytes, x) => dataView(bytes).setInt32(0, x, endian),
	read: bytes => dataView(bytes).getInt32(0, endian),
})

export const f32 = asComponent<number>({
	size: 4,
	write: (bytes, x) => dataView(bytes).setFloat32(0, x, endian),
	read: bytes => dataView(bytes).getFloat32(0, endian),
})

export const f64 = asComponent<number>({
	size: 8,
	write: (b, x) => dataView(b).setFloat64(0, x, endian),
	read: b => dataView(b).getFloat64(0, endian),
})

export const bigu64 = asComponent<bigint>({
	size: 8,
	write: (bytes, x) => dataView(bytes).setBigUint64(0, x, endian),
	read: bytes => dataView(bytes).getBigUint64(0, endian),
})

export const bigi64 = asComponent<bigint>({
	size: 8,
	write: (bytes, x) => dataView(bytes).setBigInt64(0, x, endian),
	read: bytes => dataView(bytes).getBigInt64(0, endian),
})

export const bytes = ({copy = true}: {copy?: boolean} = {}) =>
	asComponent<Uint8Array>({
		encode: value => copy ? new Uint8Array(value) : value,
		decode: bytes => copy ? new Uint8Array(bytes) : bytes,
	})

export const json = (() => {
	const textEncoder = new TextEncoder()
	const textDecoder = new TextDecoder()
	return <X extends Json = Json>() => asComponent<X>({
		encode: value => textEncoder.encode(JSON.stringify(value)),
		decode: bytes => JSON.parse(textDecoder.decode(bytes)),
	})
})()

export const vec2 = tuple(f32, f32)
export const vec3 = tuple(f32, f32, f32)
export const vec4 = tuple(f32, f32, f32, f32)

export const dvec2 = tuple(f64, f64)
export const dvec3 = tuple(f64, f64, f64)
export const dvec4 = tuple(f64, f64, f64, f64)

