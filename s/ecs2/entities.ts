
import {got, guarantee, need} from "@e280/stz"
import {fancyComponents} from "./components/fancy.js"
import {BlockMap} from "./components/blocks/block-map.js"
import {BlockSlot} from "./components/blocks/block-slot.js"
import {BlobMap, EntityId, FancyFn, JsonMap} from "./types.js"
import {ComponentValues, Components} from "./components/types.js"
import {deserializeEntities, serializeEntities} from "./utils/serialize.js"

export type Entmap<C extends Components> = Map<keyof C, BlockSlot>

export class Entities<C extends Components> {
	components: C
	#blocks: BlockMap<C>

	#records = new Map<EntityId, Entmap<C>>()
	#json: JsonMap = new Map()
	#blob: BlobMap = new Map()

	constructor(fn: FancyFn<C>) {
		this.components = fn(fancyComponents(this.#json, this.#blob))
		this.#blocks = new BlockMap(this.components)
	}

	clear() {
		this.#records.clear()
		this.#json.clear()
		this.#blob.clear()
		this.#blocks = new BlockMap(this.components)
	}

	set(id: EntityId, values: Partial<ComponentValues<C>>) {
		const entmap = guarantee(this.#records, id, (): Entmap<C> => new Map())

		// create or update fresh components
		for (const [name, value] of Object.entries(values)) {
			const slot = guarantee(entmap, name, (): BlockSlot => {
				const block = need(this.#blocks, name)
				return block.slot()
			})
			slot.write(value)
		}

		// delete stale components
		for (const name of entmap.keys()) {
			if (!Object.hasOwn(values, name)) {
				const slot = need(entmap, name)
				slot.dispose()
				entmap.delete(name)
			}
		}
	}

	get size() {
		return this.#records.size
	}

	has(id: EntityId) {
		return this.#records.has(id)
	}

	get(id: EntityId) {
		const map = this.#records.get(id)
		if (!map) return undefined
		const values = {} as any
		for (const [name, slot] of map)
			values[name] = slot.read()
		return values as Partial<ComponentValues<C>>
	}

	getWith<N extends keyof C>(id: EntityId, ...names: N[]) {
		const values = this.get(id)
		if (!values) return undefined
		for (const name of names)
			if (!Object.hasOwn(values, name))
				return undefined
		return values as any as Pick<ComponentValues<C>, N> & Partial<ComponentValues<C>>
	}

	*keys() {
		yield* this.#records.keys()
	}

	*values() {
		for (const id of this.#records.keys())
			yield got(this.get(id))
	}

	*entries() {
		for (const id of this.#records.keys())
			yield [id, got(this.get(id))] as [EntityId, Partial<ComponentValues<C>>]
	}

	*[Symbol.iterator]() {
		yield* this.entries()
	}

	serialize() {
		return serializeEntities(
			this.components,
			this.#records,
			this.#json,
			this.#blob,
		)
	}

	deserialize(file: Uint8Array) {
		this.clear()
		deserializeEntities(
			this.components,
			this.#records,
			this.#json,
			this.#blob,
		)
	}

	select<N extends keyof C>(...componentNames: N[]): [EntityId, Pick<ComponentValues<C>, N>][] {
		// TODO later
		return []
	}
}

