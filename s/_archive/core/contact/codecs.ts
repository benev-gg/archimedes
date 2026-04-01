
import * as m from "@msgpack/msgpack"
import {asCodec} from "./types.js"

export const json = asCodec({
	encode: <D>(data: D) => new TextEncoder().encode(JSON.stringify(data)),
	decode: <D>(code: Uint8Array) => JSON.parse(new TextDecoder().decode(code)) as D,
})

export const msgpack = asCodec({
	encode: <D>(data: D) => m.encode(data),
	decode: <D>(code: Uint8Array) => m.decode(code) as D,
})

