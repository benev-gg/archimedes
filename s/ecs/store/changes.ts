
import {hex} from "@e280/stz"
import {EntityId} from "../types.js"
import {Code, Store} from "./types.js"
import {Entities} from "../entities.js"
import {BinReader, BinWriter} from "../utils/bin.js"
import {OnBeforeChange} from "../utils/before-change.js"

enum ChangeKind {Whole, Patch, Destroy}
enum ChangeOp {Set, Del}

export type Changes = Uint8Array

const formatVersion = 1
const idSize = 16

export function startRecordingChanges(
		entities: Entities<any>,
		onBeforeChange: OnBeforeChange,
		store: Store,
	) {

	const dirty = new Map<EntityId, Set<Code> | null>()

	const cancel = onBeforeChange((id, code) => {
		if (code === undefined) {
			dirty.set(id, null)
		}
		else {
			const codes = dirty.get(id)

			if (codes === null) return

			if (codes)
				codes.add(code)
			else
				dirty.set(id, new Set([code]))
		}
	})

	return {
		cancel,

		done(): Changes {
			cancel()

			if (dirty.size === 0)
				return new Uint8Array()

			const write = new BinWriter()
				.u8(formatVersion)
				.bytes(hex.toBytes(store.version))

			for (const [id, codes] of dirty) {
				const entity = entities.get(id)

				if (entity === undefined) {
					write
						.u8(ChangeKind.Destroy)
						.bytes(hex.toBytes(id))
				}
				else if (codes === null) {
					const values = Object.entries(entity)
						.map(([name, value]) => [
							store.namecoder.code(name),
							value,
						] as const)
						.sort(([a], [b]) => a - b)

					write
						.u8(ChangeKind.Whole)
						.bytes(hex.toBytes(id))
						.u16(values.length)

					for (const [code, value] of values) {
						write.u16(code)
						writeValue(write, store, code, value)
					}
				}
				else {
					const sorted = [...codes].sort((a, b) => a - b)

					write
						.u8(ChangeKind.Patch)
						.bytes(hex.toBytes(id))
						.u16(sorted.length)

					for (const code of sorted) {
						const name = store.namecoder.name(code)

						if (Object.hasOwn(entity, name)) {
							write
								.u8(ChangeOp.Set)
								.u16(code)

							writeValue(write, store, code, entity[name])
						}
						else {
							write
								.u8(ChangeOp.Del)
								.u16(code)
						}
					}
				}
			}

			return write.done()
		},
	}
}

export function applyChanges(
		entities: Entities<any>,
		store: Store,
		changes: Changes,
	) {

	if (changes.length === 0)
		return

	const read = new BinReader(changes)

	if (read.u8() !== formatVersion)
		throw new Error("invalid changes format")

	if (hex(read.bytes(idSize)) !== store.version)
		throw new Error("invalid schema structure")

	while (!read.done) {
		const kind = read.u8()
		const id = hex(read.bytes(idSize))

		switch (kind) {
			case ChangeKind.Destroy:
				entities.delete(id)
				break

			case ChangeKind.Whole: {
				const entity: Record<string, any> = {}

				for (let n = read.u16(); n > 0; n--) {
					const code = read.u16()
					const name = store.namecoder.name(code)
					entity[name] = readValue(read, store, code)
				}

				entities.set(id, entity)
				break
			}

			case ChangeKind.Patch: {
				const patch: Record<string, any> = {}

				for (let n = read.u16(); n > 0; n--) {
					const op = read.u8()
					const code = read.u16()
					const name = store.namecoder.name(code)

					switch (op) {
						case ChangeOp.Set:
							patch[name] = readValue(read, store, code)
							break

						case ChangeOp.Del:
							patch[name] = undefined
							break

						default:
							throw new RangeError(`invalid change op ${op}`)
					}
				}

				if (!entities.update(id, patch))
					throw new Error(`cannot patch missing entity ${id}`)

				break
			}

			default:
				throw new RangeError(`invalid change kind ${kind}`)
		}
	}
}

function writeValue(
		write: BinWriter,
		store: Store,
		code: Code,
		value: any,
	) {

	const column = store.columns[code]

	if (!column)
		throw new RangeError(`invalid component code ${code}`)

	if ("block" in column) {
		const data = new Uint8Array(column.component.size)
		column.component.write(data, value)
		write.bytes(data)
	}
	else {
		const data = column.component.encode(value)
		write
			.u32(data.length)
			.bytes(data)
	}
}

function readValue(
		read: BinReader,
		store: Store,
		code: Code,
	) {

	const column = store.columns[code]

	if (!column)
		throw new RangeError(`invalid component code ${code}`)

	if ("block" in column)
		return column.component.read(
			read.bytes(column.component.size),
		)

	return column.component.decode(
		read.bytes(read.u32()),
	)
}

