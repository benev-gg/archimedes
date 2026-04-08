
import {GMap} from "@e280/stz"
import {Components, Id, LifecycleCallbacks, LifecycleEnter, System} from "./types.js"

export function lifecycle<C extends Components, K extends keyof C>(
		componentKeys: K[],
		enter: LifecycleEnter<C, K>
	): System<C> {

	const alive = new GMap<Id, LifecycleCallbacks<C, K>>()

	return (entities, change) => {

		// add fresh entities
		for (const [id, components] of entities.select(...componentKeys)) {
			const callbacks = alive.guarantee(id, () => enter({entities, change, id, components}))
			callbacks.tick(id, components)
		}

		// delete stale entities
		const currentIds = new Set([...entities.select(...componentKeys)].map(([id]) => id))
		for (const [id, callbacks] of alive) {
			if (currentIds.has(id)) continue
			alive.delete(id)
			callbacks.exit(id)
		}
	}
}

