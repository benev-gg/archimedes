
// import {got, guarantee} from "@e280/stz"
// import {ComponentValues, Components} from "./components/types.js"
// import {fancyComponents, FancyComponents} from "./components/fancy.js"
// import {Block, DataOffset, EntityId, Stores} from "./types.js"
//
// export class World<S extends Components> {
// 	readonly schema
// 	readonly entities
// 	#stores: Stores = {json: new Map(), blob: new Map()}
//
// 	constructor(max: number, fn: (schemes: FancyComponents) => S) {
// 		this.schema = fn(fancyComponents(this.#stores))
// 		this.entities = new Entities(max, this.schema)
// 	}
//
// 	save() {
// 		const json = new TextEncoder().encode(
// 			JSON.stringify([...this.#stores.json.entries()])
// 		)
// 		const blob = new Uint8Array() // TODO
// 		const entities = new Uint8Array() // compact storage of all blocks
// 	}
//
// 	static load() {}
// }
//
// export type WorldSchema<W extends World<any>> = W extends World<infer S>
// 	? S
// 	: never
//
// export class Entities<S extends Components> {
// 	#storage
//
// 	constructor(
// 		public readonly max: number,
// 		public readonly schema: S,
// 	) {
// 		this.#storage = new EntityStorage(max, schema)
// 	}
//
// 	select() {}
//
// 	// get size() {}
// 	set() {}
// 	get() {}
// 	has() {}
// 	clear() {}
// 	keys() {}
// 	values() {}
// 	entries() {}
// 	;[Symbol.iterator]() {}
// }
//
// export class EntityStorage<S extends Components> {
// 	#blocks = new Map<string, Block>()
// 	#addressBook = new Map<EntityId, Map<Block, DataOffset>>
//
// 	constructor(public readonly max: number, public readonly schema: S) {
// 		for (const [name, scheme] of Object.entries(schema)) {
// 			this.#blocks.set(name, {
// 				name,
// 				scheme,
// 				buffer: new Uint8Array(max * scheme.size),
// 				next: 0,
// 				free: new Set(),
// 			})
// 		}
// 	}
//
// 	add(entityId: EntityId, values: Partial<ComponentValues<S>>) {
// 		const addresses = guarantee(this.#addressBook, entityId, () => new Map<Block, DataOffset>())
// 		for (const [name, value] of Object.entries(values)) {
// 			const block = got(this.#blocks.get(name))
// 			const offset = this.#allocate(block)
// 			addresses.set(block, offset)
// 			this.#set(block, offset, value)
// 		}
// 	}
//
// 	get<C extends Partial<ComponentValues<S>>>(entityId: EntityId) {
// 		const addresses = [...got(this.#addressBook.get(entityId))]
// 		const entries = addresses.map(
// 			([block, offset]) => [block.name, this.#get(block, offset)]
// 		)
// 		return Object.fromEntries(entries) as C
// 	}
//
// 	delete(entityId: EntityId) {
// 		const addresses = got(this.#addressBook.get(entityId))
//
// 		for (const [block, offset] of addresses) {
// 			block.scheme.dispose?.(this.#bytes(block, offset))
// 			this.#free(block, offset)
// 		}
//
// 		this.#addressBook.delete(entityId)
// 	}
//
// 	*keys() {
// 		yield* this.#addressBook.keys()
// 	}
//
// 	*values() {
// 		for (const entityId of this.#addressBook.keys())
// 			yield this.get(entityId)
// 	}
//
// 	*entries() {
// 		for (const entityId of this.#addressBook.keys())
// 			yield [entityId, this.get(entityId)] as [
// 				id: EntityId,
// 				components: Partial<ComponentValues<S>>,
// 			]
// 	}
//
// 	#bytes(block: Block, offset: DataOffset) {
// 		return block.buffer.subarray(
// 			offset,
// 			offset + block.scheme.size,
// 		)
// 	}
//
// 	#set(block: Block, offset: DataOffset, value: unknown) {
// 		block.scheme.write(this.#bytes(block, offset), value)
// 	}
//
// 	#get(block: Block, offset: DataOffset) {
// 		return block.scheme.read(this.#bytes(block, offset))
// 	}
//
// 	#allocate(block: Block): DataOffset {
// 		if (block.scheme.size === 0)
// 			return 0
//
// 		const available = block.free.values().next()
//
// 		if (!available.done) {
// 			const offset = available.value
// 			block.free.delete(offset)
// 			return offset
// 		}
//
// 		const offset = block.next
// 		const next = offset + block.scheme.size
//
// 		if (next > block.buffer.byteLength)
// 			throw new RangeError(`component block "${block.name}" is full`)
//
// 		block.next = next
// 		return offset
// 	}
//
// 	#free(block: Block, offset: DataOffset) {
// 		if (block.scheme.size === 0)
// 			return
//
// 		if (block.free.has(offset))
// 			throw new Error(`double free in component block "${block.name}"`)
//
// 		block.free.add(offset)
// 	}
// }

