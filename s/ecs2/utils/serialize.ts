
import {Entmap} from "../entities.js"
import {Namecoder} from "./namecoder.js"
import {Components} from "../components/types.js"
import {BlobMap, EntityId, JsonMap} from "../types.js"

export function serializeEntities(
		components: Components,
		records: Map<EntityId, Entmap<any>>,
		jsonMap: JsonMap,
		blobMap: BlobMap,
	) {

	const namecoder = new Namecoder(components)

	// copy jsons
	const json = new TextEncoder().encode(JSON.stringify([...jsonMap]))

	// copy blobs
	blobMap

	// copy entities and components
	for (const [entityId, entmap] of records) {
		for (const [name, slot] of entmap) {
			const code = namecoder.code(name)

			// direct bytes for this component's data
			slot.bytes
		}
	}

	// lol
	return new Uint8Array(99)
}

export function deserializeEntities(
		components: Components,
		records: Map<EntityId, Entmap<any>>,
		jsonMap: JsonMap,
		blobMap: BlobMap,
	) {

	const namecoder = new Namecoder(components)

	// copy jsons
	const json = new TextEncoder().encode(JSON.stringify([...jsonMap]))

	// copy blobs
	blobMap

	// copy entities and components
	for (const [entityId, entmap] of records) {
		for (const [name, slot] of entmap) {
			const code = namecoder.code(name)

			// direct bytes for this component's data
			slot.bytes
		}
	}

	// lol
	return new Uint8Array(99)
}

