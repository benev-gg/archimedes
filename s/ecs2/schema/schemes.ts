
import {tuple} from "./tuple.js"
import {asScheme} from "./types.js"
import {dataView} from "./data-view.js"

const e = true

export const bool = asScheme<boolean>({
	size: 1,
	write: b => value => b.set([value ? 1 : 0]),
	read: b => () => (b[0]! !== 0),
})

export const u8 = asScheme<number>({
	size: 1,
	write: b => x => b.set([x]),
	read: b => () => b[0]!,
})

export const u16 = asScheme<number>({
	size: 2,
	write: b => x => dataView(b).setUint16(0, x, e),
	read: b => () => dataView(b).getUint16(0, e),
})

export const u32 = asScheme<number>({
	size: 4,
	write: b => x => dataView(b).setUint32(0, x, e),
	read: b => () => dataView(b).getUint32(0, e),
})

export const f32 = asScheme<number>({
	size: 4,
	write: b => x => dataView(b).setFloat32(0, x, e),
	read: b => () => dataView(b).getFloat32(0, e),
})

export const f64 = asScheme<number>({
	size: 8,
	write: b => x => dataView(b).setFloat64(0, x, e),
	read: b => () => dataView(b).getFloat64(0, e),
})

export const vec2 = tuple(f32, f32)
export const vec3 = tuple(f32, f32, f32)
export const vec4 = tuple(f32, f32, f32, f32)

export const hvec2 = tuple(f64, f64)
export const hvec3 = tuple(f64, f64, f64)

