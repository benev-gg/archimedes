
import {Stores} from "./types.js"
import {Scheme} from "./schema/types.js"
import {makeStoreScheme} from "./schema/store.js"

export type FancySchemes = ReturnType<typeof fancySchemes>

export function fancySchemes(stores: Stores) {
	const json = <X>() => (makeStoreScheme(stores.json) as Scheme<X>)
	const blob = makeStoreScheme<Uint8Array>(stores.blob)
	return {json, blob}
}

