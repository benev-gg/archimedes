
import {guarantee} from "@e280/stz"
import type {Entities} from "../entities.js"
import {Components, Entity, EntityId, SelectedEntry} from "../types.js"

type QueryKey = string

type Query<C extends Components> = {
	names: Set<keyof C>
	results: Map<EntityId, Partial<Entity<C>>>
}

function queryKey(names: string[]) {
	return JSON.stringify(names)
}

function updateQuery(query: Query<any>, id: EntityId, values: Record<string, any>) {
	for (const name of query.names) {
		if (!Object.hasOwn(values, name)) {
			query.results.delete(id)
			return
		}
	}
	query.results.set(id, values)
}

export class Selector<C extends Components> {
	#index = new Map<QueryKey, Query<C>>()

	constructor(private entities: Entities<C>) {}

	entityChanged(id: EntityId, values: Partial<Entity<C>>) {
		for (const query of this.#index.values())
			updateQuery(query, id, values)
	}

	entityGone(id: EntityId) {
		for (const query of this.#index.values())
			query.results.delete(id)
	}

	rebuild() {
		for (const query of this.#index.values()) {
			query.results.clear()

			for (const [id, values] of this.entities)
				updateQuery(query, id, values)
		}
	}

	#query(names: (keyof C)[]) {
		return guarantee(this.#index, queryKey(names as string[]), () => {
			const query = <Query<C>>{
				names: new Set(names),
				results: new Map(),
			}
			for (const [id, values] of this.entities)
				updateQuery(query, id, values)
			return query
		})
	}

	select<N extends keyof C>(...names: N[]) {
		return [...this.#query(names).results.entries()] as SelectedEntry<C, N>[]
	}
}

