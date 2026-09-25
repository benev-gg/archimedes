
import {guarantee} from "@e280/stz"
import {EntitiesReadonly} from "../entities.js"
import {Components, EntityId, Selected} from "../types.js"

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (values: Selected<C, K>) => void
	exit: () => void
}

export type LifecycleSpawn<C extends Components, K extends keyof C> = (
	(id: EntityId, components: Selected<C, K>) => LifecycleCallbacks<C, K>
)

export function lifecycle<C extends Components, K extends keyof C>(
		entities: EntitiesReadonly<C>,
		componentNames: K[],
		enter: LifecycleSpawn<C, K>
	) {

	const alive = new Map<EntityId, LifecycleCallbacks<C, K>>()

	return () => {
		// add fresh entities
		for (const [id, values] of entities.select(...componentNames)) {
			const callbacks = guarantee(alive, id, () => enter(id, values))
			callbacks.tick(values)
		}

		// check who's really alive now
		const aliveNow = new Set(entities.select(...componentNames).map(([id]) => id))

		// delete stale entities
		for (const [id, callbacks] of alive) {
			if (aliveNow.has(id)) continue
			alive.delete(id)
			callbacks.exit()
		}
	}
}

