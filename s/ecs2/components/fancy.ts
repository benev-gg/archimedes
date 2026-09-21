
import {Component} from "./types.js"
import {makeStoreScheme} from "./store.js"
import {BlobStore, JsonStore} from "../types.js"

export type FancyComponents = ReturnType<typeof fancyComponents>

export function fancyComponents(jsonStore: JsonStore, blobStore: BlobStore) {
	const json = <X>() => (makeStoreScheme(jsonStore) as Component<X>)
	const blob = makeStoreScheme<Uint8Array>(blobStore)
	return {json, blob}
}

