
import {guarantee} from "@e280/stz"
import {EntitiesReadonly} from "./entities.js"
import {Components, Id, LifecycleCallbacks, LifecycleEnter} from "./types.js"

export function lifecycle<C extends Components, K extends keyof C>(
		entities: EntitiesReadonly<C>,
		componentKeys: K[],
		enter: LifecycleEnter<C, K>
	) {

	const alive = new Map<Id, LifecycleCallbacks<C, K>>()

	return () => {

		// add fresh entities
		for (const [id, components] of entities.select(...componentKeys)) {
			const callbacks = guarantee(alive, id, () => enter(id, components))
			callbacks.tick(components)
		}

		// delete stale entities
		const currentIds = new Set([...entities.select(...componentKeys)].map(([id]) => id))
		for (const [id, callbacks] of alive) {
			if (currentIds.has(id)) continue
			alive.delete(id)
			callbacks.exit()
		}
	}
}

