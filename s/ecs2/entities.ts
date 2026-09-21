
import {got, guarantee, need} from "@e280/stz"
import {StoredComponent} from "./utils/component.js"
import {BlobStore, EntityId, JsonStore} from "./types.js"
import {BlockStore, makeBlocks} from "./schema/blocks.js"
import {SchematicValues, Schematic} from "./schema/types.js"
import {fancySchemes, FancySchemes} from "./fancy-schemes.js"

export class Entities<S extends Schematic> {
	#fn
	#jsonStore!: JsonStore
	#blobStore!: BlobStore
	#blockStore!: BlockStore<S>
	#records = new Map<EntityId, Map<keyof S, StoredComponent>>()

	constructor(fn: (schemes: FancySchemes) => S) {
		this.#fn = fn
		this.clear()
	}

	clear() {
		this.#jsonStore = new Map()
		this.#blobStore = new Map()
		this.#blockStore = makeBlocks(100_000, this.#fn(fancySchemes(this.#jsonStore, this.#blobStore)))
		this.#records.clear()
	}

	set(id: EntityId, values: Partial<SchematicValues<S>>) {
		const record = guarantee(this.#records, id, () => new Map<keyof S, StoredComponent>())

		// create or update fresh components
		for (const [name, value] of Object.entries(values)) {
			const block = need(this.#blockStore, name)
			const component = guarantee(record, name, () => new StoredComponent(block))
			component.write(value)
		}

		// delete stale components
		for (const name of record.keys()) {
			if (!Object.hasOwn(values, name)) {
				const component = need(record, name)
				component.dispose()
				record.delete(name)
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
		for (const [name, component] of map)
			values[name] = component.read()
		return values as Partial<SchematicValues<S>>
	}

	getWith<N extends keyof S>(id: EntityId, ...names: N[]) {
		const values = this.get(id)
		if (!values) return undefined
		for (const name of names)
			if (!Object.hasOwn(values, name))
				return undefined
		return values as any as Pick<SchematicValues<S>, N> & Partial<SchematicValues<S>>
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
			yield [id, got(this.get(id))] as [EntityId, Partial<SchematicValues<S>>]
	}

	*[Symbol.iterator]() {
		yield* this.entries()
	}

	select<N extends keyof S>(...componentNames: N[]): [EntityId, Pick<SchematicValues<S>, N>][] {
		// TODO later
		return []
	}
}

