
import {MapG, sub} from "@e280/stz"
import {System} from "./system.js"
import {Entity} from "./entity.js"
import {IdCounter} from "../../tools/id-counter.js"
import {Components, EntityId, PartialEntityEntry} from "./types.js"

export class Assembly<Context, C extends Components> {
	#entities = new MapG<number, Entity<Partial<C>>>()
	counter = new IdCounter()

	on = {
		created: sub<[Entity<Partial<C>>]>(),
		updated: sub<[Entity<Partial<C>>]>(),
		deleted: sub<[EntityId]>(),
	}

	constructor(public context: Context, private systems: System[]) {}

	get<C2 extends Partial<C2>>(id: number) {
		return this.#entities.get(id) as Entity<C2> | undefined
	}

	require<C2 extends Partial<C2>>(id: number) {
		return this.#entities.require(id) as unknown as C2
	}

	/** create or update an entity */
	write<C2 extends Partial<C>>(id: number, components: C2) {
		const entity = this.#entities.guarantee(id, () => new Entity(id, components)) as Entity<C2>
		entity.components = components
		for (const system of this.systems)
			system.cacheUpdate(id, entity)
		this.on.created.pub(entity)
		return entity
	}

	/** create a new entity */
	create<C2 extends Partial<C>>(components: C2) {
		const id = this.counter.next()
		return this.write(id, components)
	}

	/** delete an entity, dispatching relevant pubsubs */
	delete(id: number) {
		this.#entities.delete(id)
		for (const system of this.systems)
			system.cacheDelete(id)
		this.on.deleted.pub(id)
	}

	/** forget everything and start from a new state */
	overwrite(entries: PartialEntityEntry<C>[]) {
		const data = new MapG(entries)

		for (const [id, components] of data)
			this.write(id, components)

		for (const {id} of this.#entities.values())
			if (!data.has(id))
				this.delete(id)
	}

	/** execute all systems */
	execute() {
		for (const system of this.systems)
			system.execute(this)
	}

	replicate<Context, C extends Components>(
			upstream: Assembly<any, any>,
			context: Context,
			systems: System[],
		) {
		const downstream = new Assembly<Context, C>(context, systems)
		const unattachers = [
			upstream.on.created((...p) => downstream.on.created.pub(...p)),
			upstream.on.updated((...p) => downstream.on.updated.pub(...p)),
			upstream.on.deleted((...p) => downstream.on.deleted.pub(...p)),
		]
		const detach = () => unattachers.forEach(f => f())
		return [downstream, detach]
	}
}

