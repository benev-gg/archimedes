
import {got, guarantee, need} from "@e280/stz"
import {Component} from "./utils/component.js"
import {BlobStore, EntityId, JsonStore} from "./types.js"
import {BlockStore, makeBlocks} from "./schema/blocks.js"
import {SchematicValues, Schematic} from "./schema/types.js"
import {fancySchemes, FancySchemes} from "./fancy-schemes.js"

export class Entities<S extends Schematic> {
	#blockStore: BlockStore<S>
	#jsonStore: JsonStore
	#blobStore: BlobStore
	#books = new Map<EntityId, Map<keyof S, Component>>()

	constructor(
			public readonly max: number,
			private readonly fn: (schemes: FancySchemes) => S,
		) {
		this.#jsonStore = new Map()
		this.#blobStore = new Map()
		const schema = fn(fancySchemes(this.#jsonStore, this.#blobStore))
		this.#blockStore = makeBlocks(max, schema)
	}

	set(id: EntityId, values: Partial<SchematicValues<S>>) {
		const components = guarantee(this.#books, id, () => new Map<keyof S, Component>())

		// create or update fresh components
		for (const [name, value] of Object.entries(values)) {
			const block = need(this.#blockStore, name)
			const component = guarantee(components, name, () => new Component(block))
			component.write(value)
		}

		// delete stale components
		for (const name of components.keys()) {
			if (!Object.hasOwn(values, name)) {
				const component = need(components, name)
				component.dispose()
				components.delete(name)
			}
		}
	}

	get size() {
		return this.#books.size
	}

	has(id: EntityId) {
		return this.#books.has(id)
	}

	get(id: EntityId) {
		const map = this.#books.get(id)
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
		return values as any as Pick<SchematicValues<S>, N>
	}

	clear() {
		this.#jsonStore = new Map()
		this.#blobStore = new Map()
		this.#books = new Map<EntityId, Map<keyof S, Component>>()
		const schema = this.fn(fancySchemes(this.#jsonStore, this.#blobStore))
		this.#blockStore = makeBlocks(this.max, schema)
	}

	*keys() {
		yield* this.#books.keys()
	}

	*values() {
		for (const id of this.#books.keys())
			yield got(this.get(id))
	}

	*entries() {
		for (const id of this.#books.keys())
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

