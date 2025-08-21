
export type Codec = {
	encode: <Data>(data: Data) => Uint8Array
	decode: <Data>(code: Uint8Array) => Data
}

export const asCodec = (t: Codec) => t

