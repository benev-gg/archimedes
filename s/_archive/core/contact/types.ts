
import {Contact} from "./contact.js"

/** infer a contact's input data type */
export type ContactInput<C extends Contact> = (
	C extends Contact<infer I>
		? I
		: never
)

/** infer a contact's output data type */
export type ContactOutput<C extends Contact> = (
	C extends Contact<any, infer O>
		? O
		: never
)

export type Codec = {
	encode: <Data>(data: Data) => Uint8Array
	decode: <Data>(code: Uint8Array) => Data
}

export const asCodec = (t: Codec) => t

