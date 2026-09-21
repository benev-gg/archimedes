
import {tuple} from "./tuple.js"
import {asSchema} from "./types.js"
import {dataView} from "../utils/data-view.js"

export const endian = true

export const bool = asSchema<boolean>({
	size: 1,
	write: (bytes, value) => bytes[0] = value ?1 :0,
	read: b => (b[0]! !== 0),
	delete: () => {},
})

export const u8 = asSchema<number>({
	size: 1,
	write: (bytes, x) => bytes.set([x]),
	read: bytes => bytes[0]!,
	delete: () => {},
})

export const u16 = asSchema<number>({
	size: 2,
	write: (bytes, x) => dataView(bytes).setUint16(0, x, endian),
	read: bytes => dataView(bytes).getUint16(0, endian),
	delete: () => {},
})

export const u32 = asSchema<number>({
	size: 4,
	write: (bytes, x) => dataView(bytes).setUint32(0, x, endian),
	read: bytes => dataView(bytes).getUint32(0, endian),
	delete: () => {},
})

export const f32 = asSchema<number>({
	size: 4,
	write: (bytes, x) => dataView(bytes).setFloat32(0, x, endian),
	read: bytes => dataView(bytes).getFloat32(0, endian),
	delete: () => {},
})

export const f64 = asSchema<number>({
	size: 8,
	write: (b, x) => dataView(b).setFloat64(0, x, endian),
	read: b => dataView(b).getFloat64(0, endian),
	delete: () => {},
})

export const vec2 = tuple(f32, f32)
export const vec3 = tuple(f32, f32, f32)
export const vec4 = tuple(f32, f32, f32, f32)

export const hvec2 = tuple(f64, f64)
export const hvec3 = tuple(f64, f64, f64)

