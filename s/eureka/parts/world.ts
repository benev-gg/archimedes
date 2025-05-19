
import {deep, MapG, sub} from "@e280/stz"
import {System} from "./system.js"
import {Entity} from "./entity.js"
import {IdCounter} from "../../tools/id-counter.js"
import {Components, EntityId, EntityData, UnknownComponents} from "./types.js"

export class World<Context, C extends Components> {
	counter = new IdCounter()
	onEntity = sub<[EntityId, Entity<UnknownComponents<C>> | null]>()

	#entities = new MapG<EntityId, Entity<Partial<C>>>()
	#changed = new Set<EntityId>()

	constructor(public context: Context, private systems: System[]) {}

	/** iterate all entities */
	all() {
		return this.#entities.values()
	}

	/** iterate all entity ids */
	ids() {
		return this.#entities.keys()
	}

	/** get an entity by id (return null if not found) */
	get<C2 extends Partial<C2>>(id: number) {
		return (this.#entities.get(id) ?? null) as Entity<C2> | null
	}

	/** get an entity by id (throw an error if not found) */
	require<C2 extends Partial<C2>>(id: number) {
		return this.#entities.require(id) as unknown as C2
	}

	/** create, update, or delete an entity */
	write<C2 extends Partial<C>>(id: number, components: C2 | null) {
		if (components) {
			const onChange = () => this.#changed.add(id)

			// get or create entity
			const entity = this.#entities.guarantee(
				id,
				() => new Entity(id, onChange),
			) as Entity<C2>

			Entity.setComponents(entity, components)

			// initialize the systems cache for this entity
			for (const system of this.systems)
				system.cache(id, entity)

			// recognize that a change happened
			this.onEntity.pub(id, entity)
			return entity
		}
		else {
			// delete the entity
			this.#entities.delete(id)

			// update the cache
			for (const system of this.systems)
				system.cache(id, null)

			// recognize that a change happened
			this.onEntity.pub(id, null)
			return null
		}
	}

	/** create a new entity */
	create<C2 extends Partial<C>>(components: C2) {
		const id = this.counter.next()
		return this.write(id, components)!
	}

	/** update or create an entity */
	update<C2 extends Partial<C>>(id: number, components: C2) {
		return this.write(id, components) as Entity<C2>
	}

	/** delete an entity, dispatching relevant pubsubs */
	delete(id: number) {
		return this.write(id, null)
	}

	/** iterate all entity data */
	*data() {
		for (const entity of this.all())
			yield entity.data()
	}

	/** delete everything */
	clear() {
		for (const id of [...this.#entities.keys()])
			this.delete(id)
	}

	/** forget everything and start from a new state */
	overwrite(data: EntityData<C>[]) {
		for (const [id, components] of data)
			this.write(id, components)
	}

	/** execute all systems (and maintain caching stuff) */
	execute() {
		// execute all systems
		for (const system of this.systems) {
			system.execute(this)

			// update all system caches for changes
			for (const id of this.#changed) {
				const entity = this.get(id)
				for (const system of this.systems)
					system.cache(id, entity)
			}
		}

		// dispatch all pent up changes
		for (const id of this.#changed)
			this.onEntity.pub(id, this.get(id))

		// clear changes
		this.#changed.clear()
	}

	/** create a new downstream clone world that stays synchronized with this one */
	replicate(
			context: Context,
			systems: System[],
		) {
		const downstream = new World<Context, C>(context, systems)
		const detach = this.onEntity((id, entity) => {
			downstream.write(id, deep.clone(entity?.components ?? null))
		})
		return [downstream, detach]
	}
}

