
import {Schema} from "./schema/types.js"
import {BlobStore, JsonStore} from "./types.js"
import {makeStoreScheme} from "./schema/store.js"

export type FancySchemes = ReturnType<typeof fancySchemes>

export function fancySchemes(jsonStore: JsonStore, blobStore: BlobStore) {
	const json = <X>() => (makeStoreScheme(jsonStore) as Schema<X>)
	const blob = makeStoreScheme<Uint8Array>(blobStore)
	return {json, blob}
}

