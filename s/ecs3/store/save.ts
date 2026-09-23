
import {bytes, hex, txt} from "@e280/stz"
import {Store} from "./types.js"
import {storeCreateEntity, storeGetBytes, storeWriteBytes} from "./store.js"
import {endian} from "../utils/consts.js"
import {dataView} from "../utils/data-view.js"

export const magic = txt.toBytes("@benev/archimedes:store:v1")

export function storeSave(store: Store) {
	return bytes.concat([
		magic,
		hex.toBytes(store.version),
		saveData(store),
	])
}

export function saveData(store: Store) {
	const parts: Uint8Array[] = [
		u32(store.addresses.size),
	]

	for (const [id, addresses] of store.addresses) {
		const codes = [...addresses.keys()].sort((a, b) => a - b)

		parts.push(
			hex.toBytes(id),
			u32(codes.length),
		)

		for (const code of codes) {
			const column = store.columns[code]!
			const data = storeGetBytes(store, id, code)

			parts.push(u32(code))

			if ("block" in column)
				parts.push(data)
			else
				parts.push(
					u32(data.length),
					data,
				)
		}
	}

	return bytes.concat(parts)
}

export function storeLoad(store: Store, file: Uint8Array) {
	const gobble = byteGobbler(file)
	const storeVersion = hex.toBytes(store.version)

	if (!bytes.eq(gobble(magic.length), magic))
		throw new Error("invalid file type")

	if (!bytes.eq(gobble(storeVersion.length), storeVersion))
		throw new Error("invalid schema structure")

	loadData(store, file.subarray(magic.length + storeVersion.length))
}

export function loadData(store: Store, file: Uint8Array) {
	const gobble = byteGobbler(file)

	const entityCount = readU32(gobble(4))

	for (let e = 0; e < entityCount; e++) {
		const id = hex(gobble(16))
		const componentCount = readU32(gobble(4))

		storeCreateEntity(store, id)

		for (let c = 0; c < componentCount; c++) {
			const code = readU32(gobble(4))
			const column = store.columns[code]

			if (!column)
				throw new RangeError(`invalid component code ${code}`)

			const data = "block" in column
				? gobble(column.component.size)
				: gobble(readU32(gobble(4)))

			storeWriteBytes(store, id, code, data)
		}
	}
}

function readU32(data: Uint8Array) {
	return dataView(data).getUint32(0, endian)
}

function u32(x: number) {
	const data = new Uint8Array(4)
	dataView(data).setUint32(0, x, endian)
	return data
}

function byteGobbler(b: Uint8Array) {
	let offset = 0
	return (length: number) => {
		const next = offset + length
		if (next > b.length) throw new RangeError("unexpected end of file")
		const chunk = b.subarray(offset, next)
		offset = next
		return chunk
	}
}

