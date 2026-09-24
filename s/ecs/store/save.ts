
import {bytes, hex, txt} from "@e280/stz"
import {Store} from "./types.js"
import {endian} from "../utils/consts.js"
import {dataView} from "../utils/data-view.js"
import {storeCreateEntity, storeGetBytes, storeWriteBytes} from "./fns.js"

const magic = txt.toBytes("@benev/archimedes:store:v1")
const idSize = 16
const u32Size = 4
const u16Size = 2

export function storeSave(store: Store) {
	return bytes.concat([
		magic,
		hex.toBytes(store.version),
		saveData(store),
	])
}

function saveData(store: Store) {
	const parts: Uint8Array[] = [u32(store.addresses.size)]

	for (const [id, addresses] of store.addresses) {
		const codes = [...addresses.keys()].sort((a, b) => a - b)

		parts.push(
			hex.toBytes(id),
			u32(codes.length),
		)

		for (const code of codes) {
			const column = store.columns[code]!
			const data = storeGetBytes(store, id, code)

			parts.push(
				u16(code),
				...("block" in column
					? [data]
					: [u32(data.length), data]),
			)
		}
	}

	return bytes.concat(parts)
}

export function storeLoad(store: Store, file: Uint8Array) {
	const read = byteReader(file)
	const version = hex.toBytes(store.version)

	if (!bytes.eq(read.bytes(magic.length), magic))
		throw new Error("invalid file type")

	if (!bytes.eq(read.bytes(version.length), version))
		throw new Error("invalid schema structure")

	loadData(store, read)
}

function loadData(store: Store, read: ByteReader) {
	const entityCount = read.u32()

	for (let e = 0; e < entityCount; e++) {
		const id = hex(read.bytes(idSize))
		const componentCount = read.u32()

		storeCreateEntity(store, id)

		for (let c = 0; c < componentCount; c++) {
			const code = read.u16()
			const column = store.columns[code]

			if (!column)
				throw new RangeError(`invalid component code ${code}`)

			const data = "block" in column
				? read.bytes(column.component.size)
				: read.bytes(read.u32())

			storeWriteBytes(store, id, code, data)
		}
	}
}

function u32(x: number) {
	const data = new Uint8Array(u32Size)
	dataView(data).setUint32(0, x, endian)
	return data
}

function u16(x: number) {
	const data = new Uint8Array(u16Size)
	dataView(data).setUint16(0, x, endian)
	return data
}

type ByteReader = ReturnType<typeof byteReader>

function byteReader(data: Uint8Array) {
	let offset = 0

	const readBytes = (length: number) => {
		const next = offset + length

		if (next > data.length)
			throw new RangeError("unexpected end of file")

		const chunk = data.subarray(offset, next)
		offset = next
		return chunk
	}

	return {
		bytes: readBytes,
		u32: () => dataView(readBytes(u32Size)).getUint32(0, endian),
		u16: () => dataView(readBytes(u16Size)).getUint16(0, endian),
	}
}

