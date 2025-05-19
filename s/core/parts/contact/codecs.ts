
import {decode, encode} from "@msgpack/msgpack"

export type Codec = {
	encode: <D>(data: D) => Uint8Array
	decode: <D>(code: Uint8Array) => D
}

export const asCodec = <T extends Codec>(t: T) => t

export const codecs = {
	json: asCodec({
		encode: <D>(data: D) => new TextEncoder().encode(JSON.stringify(data)),
		decode: <D>(code: Uint8Array) => JSON.parse(new TextDecoder().decode(code)) as D,
	}),
	msgpack: asCodec({
		encode: <D>(data: D) => encode(data),
		decode: <D>(code: Uint8Array) => decode(code) as D,
	}),
}

