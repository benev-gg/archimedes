
import {got, guarantee, need} from "@e280/stz"
import {Blocks} from "./components/blocks/blocks.js"
import {BlobStore, EntityId, JsonStore} from "./types.js"
import {BlockSlot} from "./components/blocks/block-slot.js"
import {ComponentValues, Components} from "./components/types.js"
import {fancyComponents, FancyComponents} from "./components/fancy.js"

type Entmap<C extends Components> = Map<keyof C, BlockSlot>

export class Entities<C extends Components> {
	#fn
	#json!: JsonStore
	#blob!: BlobStore
	#blocks!: Blocks<C>
	#records = new Map<EntityId, Entmap<C>>()

	constructor(fn: (fancy: FancyComponents) => C) {
		this.#fn = fn
		this.clear()
	}

	clear() {
		this.#json = new Map()
		this.#blob = new Map()
		const components = this.#fn(fancyComponents(this.#json, this.#blob))
		this.#blocks = new Blocks(components)
		this.#records.clear()
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

	select<N extends keyof C>(...componentNames: N[]): [EntityId, Pick<ComponentValues<C>, N>][] {
		// TODO later
		return []
	}
}

