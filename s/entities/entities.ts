
import {got, need} from "@e280/stz"
import {Store} from "./store/types.js"
import {makeStore} from "./store/make.js"
import {Selector} from "./utils/selector.js"
import {assertIdIsValid} from "./utils/is-id.js"
import {Components} from "../components/types.js"
import {storeLoad, storeSave} from "./store/save.js"
import {startRecordingRollback} from "./utils/rollback.js"
import {makeOnBeforeChange} from "./utils/before-change.js"
import {Entity, EntityId, Patch, Selected} from "./types.js"
import {applyChanges, Changes, startRecordingChanges} from "./store/changes.js"
import {storeCreateEntity, storeDeleteEntity, storeDeleteValue, storeGetValues, storeWriteValue} from "./store/fns.js"

export type EntitiesReadonly<C extends Components = any> = Omit<Entities<C>, (
	| "clear"
	| "set"
	| "update"
	| "delete"
	| "load"
	| "applyChanges"
	| "startRecordingChanges"
	| "startRecordingRollback"
)>

export class Entities<C extends Components> {
	#store
	#selector = new Selector<C>(this)
	#onBeforeChange = makeOnBeforeChange()

	constructor(public readonly components: C) {
		this.#store = makeStore(components)
	}

	clear() {
		this.#replaceStore(makeStore(this.components))
	}

	get readonly() {
		return this as EntitiesReadonly<C>
	}

	get version() {
		return this.#store.version
	}

	get(id: EntityId) {
		const values = storeGetValues(this.#store, id)
		return values as Partial<Entity<C>> | undefined
	}

	got(id: EntityId) {
		return need(this, id)
	}

	delete(id: EntityId) {
		this.#onBeforeChange.publish(id)
		this.#selector.entityGone(id)
		return storeDeleteEntity(this.#store, id)
	}

	set<V extends Partial<Entity<C>>>(id: EntityId, values: V) {
		assertIdIsValid(id)
		this.#onBeforeChange.publish(id)

		if (!this.#store.addresses.has(id))
			storeCreateEntity(this.#store, id)

		const addresses = this.#store.addresses.get(id)!

		for (const code of [...addresses.keys()]) {
			const name = this.#store.namecoder.name(code)
			if (!Object.hasOwn(values, name))
				storeDeleteValue(this.#store, id, code)
		}

		for (const [name, value] of Object.entries(values)) {
			const code = this.#store.namecoder.code(name)
			if (value === undefined)
				storeDeleteValue(this.#store, id, code)
			else
				storeWriteValue(this.#store, id, code, value)
		}

		this.#selector.entityChanged(id, this.got(id))
		return id
	}

	update(id: EntityId, patch: Patch<C>) {
		if (!this.#store.addresses.has(id))
			return false

		for (const [name, value] of Object.entries(patch)) {
			const code = this.#store.namecoder.code(name)
			this.#onBeforeChange.publish(id, code)

			if (value === undefined)
				storeDeleteValue(this.#store, id, code)
			else
				storeWriteValue(this.#store, id, code, value)
		}

		this.#selector.entityChanged(id, this.got(id))
		return true
	}

	getWith<N extends keyof C>(id: EntityId, ...names: N[]) {
		const values = this.get(id)
		if (!values) return undefined
		for (const name of names)
			if (!Object.hasOwn(values, name))
				return undefined
		return values as Selected<C, N>
	}

	get size() {
		return this.#store.addresses.size
	}

	has(id: EntityId) {
		return this.#store.addresses.has(id)
	}

	*keys() {
		yield* this.#store.addresses.keys()
	}

	*values() {
		for (const id of this.#store.addresses.keys())
			yield got(this.get(id))
	}

	*entries() {
		for (const id of this.#store.addresses.keys())
			yield [id, got(this.get(id))] as [EntityId, Partial<Entity<C>>]
	}

	*[Symbol.iterator]() {
		yield* this.entries()
	}

	save() {
		return storeSave(this.#store)
	}

	load(file: Uint8Array) {
		this.#replaceStore(storeLoad(this.components, file))
	}

	select<N extends keyof C>(...componentNames: N[]) {
		return this.#selector.select(...componentNames)
	}

	startRecordingRollback() {
		return startRecordingRollback(this, this.#onBeforeChange)
	}

	startRecordingChanges() {
		return startRecordingChanges(this, this.#onBeforeChange, this.#store)
	}

	applyChanges(changes: Changes) {
		applyChanges(this, this.#store, changes)
	}

	#replaceStore(store: Store) {
		const ids = new Set([
			...this.#store.addresses.keys(),
			...store.addresses.keys(),
		])

		for (const id of ids)
			this.#onBeforeChange.publish(id)

		this.#store = store
		this.#selector.rebuild()
	}
}

