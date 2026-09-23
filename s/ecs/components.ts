
import {tuple} from "./parts/tuple.js"
import {endian} from "./utils/consts.js"
import {asComponent, Json} from "./types.js"
import {dataView} from "./utils/data-view.js"

export const bool = asComponent<boolean>({
	version: "abbf2bd9163054c5b0f3819b33041476",
	size: 1,
	write: (bytes, value) => bytes[0] = value ?1 :0,
	read: bytes => (bytes[0]! !== 0),
})

export const u8 = asComponent<number>({
	version: "d4a89c076ef83b20f25e96dfc5705e00",
	size: 1,
	write: (bytes, x) => bytes[0] = x,
	read: bytes => bytes[0]!,
})

export const u16 = asComponent<number>({
	version: "2f5924fae4c7604a6f2b79d8ac735327",
	size: 2,
	write: (bytes, x) => dataView(bytes).setUint16(0, x, endian),
	read: bytes => dataView(bytes).getUint16(0, endian),
})

export const u32 = asComponent<number>({
	version: "3a2027117722ad4220f0b2082d21a711",
	size: 4,
	write: (bytes, x) => dataView(bytes).setUint32(0, x, endian),
	read: bytes => dataView(bytes).getUint32(0, endian),
})

export const i8 = asComponent<number>({
	version: "f08c13a29db557f6d04e90848c66770e",
	size: 1,
	write: (bytes, x) => dataView(bytes).setInt8(0, x),
	read: bytes => dataView(bytes).getInt8(0),
})

export const i16 = asComponent<number>({
	version: "569187b062a88366cee61e7ff0b2248d",
	size: 2,
	write: (bytes, x) => dataView(bytes).setInt16(0, x, endian),
	read: bytes => dataView(bytes).getInt16(0, endian),
})

export const i32 = asComponent<number>({
	version: "fac7a25850a9c7e05f83e1f9d6ee217b",
	size: 4,
	write: (bytes, x) => dataView(bytes).setInt32(0, x, endian),
	read: bytes => dataView(bytes).getInt32(0, endian),
})

export const f32 = asComponent<number>({
	version: "bb09fe9a6b36f6f2b843476eece5e7ec",
	size: 4,
	write: (bytes, x) => dataView(bytes).setFloat32(0, x, endian),
	read: bytes => dataView(bytes).getFloat32(0, endian),
})

export const f64 = asComponent<number>({
	version: "3d653af09f52a55420b43ad32f12e623",
	size: 8,
	write: (b, x) => dataView(b).setFloat64(0, x, endian),
	read: b => dataView(b).getFloat64(0, endian),
})

export const bigu64 = asComponent<bigint>({
	version: "2cbcd33de0587c1a090d7c7b4b2f2e49",
	size: 8,
	write: (bytes, x) => dataView(bytes).setBigUint64(0, x, endian),
	read: bytes => dataView(bytes).getBigUint64(0, endian),
})

export const bigi64 = asComponent<bigint>({
	version: "17ec0a6a54a6cfa6aae87b8bfbcaef1f",
	size: 8,
	write: (bytes, x) => dataView(bytes).setBigInt64(0, x, endian),
	read: bytes => dataView(bytes).getBigInt64(0, endian),
})

export const vec2 = tuple(f32, f32)
export const vec3 = tuple(f32, f32, f32)
export const vec4 = tuple(f32, f32, f32, f32)

export const dvec2 = tuple(f64, f64)
export const dvec3 = tuple(f64, f64, f64)
export const dvec4 = tuple(f64, f64, f64, f64)

export const bytes = ({
		copy = true,
		version = "764108dd23a178f50721e5d0aae20492",
	}: {
		copy?: boolean
		version?: string
	} = {}) =>
	asComponent<Uint8Array>({
		version,
		encode: value => copy ? new Uint8Array(value) : value,
		decode: bytes => copy ? new Uint8Array(bytes) : bytes,
	})

export const json = (({
		version = "70ff6e2383fafeb83e54350349ab2818",
	}: {
		version?: string
	} = {}) => {
	const textEncoder = new TextEncoder()
	const textDecoder = new TextDecoder()
	return <X extends Json = Json>() => asComponent<X>({
		version,
		encode: value => textEncoder.encode(JSON.stringify(value)),
		decode: bytes => JSON.parse(textDecoder.decode(bytes)),
	})
})()

