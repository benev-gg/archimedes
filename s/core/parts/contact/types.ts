
import {Contact} from "./contact.js"

/** infer a contact's input data type */
export type ContactInput<C extends Contact> = (
	C extends Contact<infer I>
		? I
		: never
)

/** infer a contact's input data type */
export type ContactOutput<C extends Contact> = (
	C extends Contact<any, infer O>
		? O
		: never
)

