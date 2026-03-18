
import {GMap, hex} from "@e280/stz"

export const makeId = () => hex.random(8)

export type Id = string
export type ComponentName = string
export type Components = {[name: ComponentName]: unknown}
export type AsComponents<C extends Components> = C

export type Entities<C extends Components> = GMap<Id, Partial<C>>
export type Change = [id: Id, components?: Partial<Components>]

export type World<C extends Components> = {
	entities: Entities<C>
	changes: Change[]
}

export type System<C extends Components> = (entities: Entities<C>) => Generator<Change>

export const asSystem = <C extends Components>(s: System<C>) => s

export function makeEntities<C extends Components>(): Entities<C> {
	return new GMap()
}

export function newEntity<C extends Components>(components: Partial<C>): Change {
	return [makeId(), components]
}

export function makeIndex<C extends Components>(entities: Entities<C>) {
	const index = new GMap<Set<keyof C>, Entities<C>>()

	function isMatch(set: Set<keyof C>, components: Partial<C>) {
		return [...set].every(key => key in components)
	}

	function obtain(componentNames: (keyof C)[]) {
		for (const set of index.keys()) {
			if (set.size !== componentNames.length) continue
			if (componentNames.every(name => set.has(name)))
				return index.require(set)
		}
		const set = new Set(componentNames)
		const ents: Entities<C> = new GMap()
		index.set(set, ents)
		for (const [id, components] of entities)
			if (isMatch(set, components))
				ents.set(id, components)
		return ents
	}

	function update(id: Id, components: Partial<C>) {
		for (const [set, ents] of index) {
			if (isMatch(set, components)) ents.set(id, components)
			else ents.delete(id)
		}
	}

	function eliminate(id: Id) {
		for (const ents of index.values())
			ents.delete(id)
	}

	return {obtain, update, eliminate}
}

export function makeWorld<C extends Components>(entities: Entities<C> = new GMap()) {
	const index = makeIndex<C>(entities)

	function *select<K extends keyof C>(...required: K[]) {
		for (const entity of index.obtain(required)) {
			const [,components] = entity
			if (required.every(r => r in components))
				yield entity as [id: Id, components: {[P in K]: C[K]}]
		}
	}

	function apply(changes: Change[]) {
		for (const [id, components] of changes) {
			if (components) {
				entities.set(id, components as Partial<C>)
				index.update(id, components as Partial<C>)
			}
			else {
				entities.delete(id)
				index.eliminate(id)
			}
		}
	}

	function execute(systems: System<C>[]) {
		return systems.flatMap(system => {
			const changes = [...system(entities)]
			apply(changes)
			return changes
		})
	}

	return {entities, select, apply, execute}
}

