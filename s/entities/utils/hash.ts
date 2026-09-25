
import {txt} from "@e280/stz"
import {blake3} from "@awasm/noble"

import {endian} from "./consts.js"
import {dataView} from "./data-view.js"

enum EntropyType {String, Number, Bytes}

export function hash(...entropy: (string | number | Uint8Array)[]) {
	if (entropy.length === 0)
		throw new RangeError("hash requires entropy")

	const hasher = blake3.create()
	const typeTag = new Uint8Array(1)
	const lengthTag = new Uint8Array(4)
	const lengthDataview = dataView(lengthTag)

	for (const part of entropy) {
		if (typeof part === "string") {
			const bytes = txt.toBytes(part)
			typeTag[0] = EntropyType.String
			lengthDataview.setUint32(0, bytes.byteLength, endian)
			hasher.update(typeTag)
			hasher.update(lengthTag)
			hasher.update(bytes)
		}
		else if (typeof part === "number") {
			const bytes = new Uint8Array(8)
			dataView(bytes).setFloat64(0, part, endian)
			typeTag[0] = EntropyType.Number
			lengthDataview.setUint32(0, bytes.byteLength, endian)
			hasher.update(typeTag)
			hasher.update(lengthTag)
			hasher.update(bytes)
		}
		else if (part instanceof Uint8Array) {
			typeTag[0] = EntropyType.Bytes
			lengthDataview.setUint32(0, part.byteLength, endian)
			hasher.update(typeTag)
			hasher.update(lengthTag)
			hasher.update(part)
		}
		else throw new Error("unknown part type")
	}

	return hasher.digest() as Uint8Array
}

