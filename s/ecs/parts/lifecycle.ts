
import {GMap} from "@e280/stz"
import {Components, Id, LifecycleCallbacks, LifecycleEnter, System} from "./types.js"

export function lifecycle<C extends Components, K extends keyof C>(
		componentKeys: K[],
		enter: LifecycleEnter<C, K>
	): System<C> {

	const alive = new GMap<Id, LifecycleCallbacks<C, K>>()

	return (entities, commit) => {
		const current = new Map(entities.select(...componentKeys))

		for (const [id, callbacks] of alive) {
			if (current.has(id)) continue
			alive.delete(id)
			callbacks.exit(id)
		}

		for (const [id, components] of current) {
			const callbacks = alive.guarantee(id, () => enter(id, components, commit))
			callbacks.tick(id, components)
		}
	}
}

