
import {Component} from "./types.js"
import {makeStoreComponent} from "./store.js"
import {BlobMap, JsonMap} from "../types.js"

export type FancyComponents = ReturnType<typeof fancyComponents>

export function fancyComponents(jsonStore: JsonMap, blobStore: BlobMap) {
	const json = <X>() => (makeStoreComponent(jsonStore) as Component<X>)
	const blob = makeStoreComponent<Uint8Array>(blobStore)
	return {json, blob}
}

