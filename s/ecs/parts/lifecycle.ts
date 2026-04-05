
import {GMap} from "@e280/stz"
import {EntitiesReadonly} from "./entities.js"
import {Commit, Components, Id, LifecycleCallbacks, LifecycleEnter, System} from "./types.js"

export function lifecycle<C extends Components, K extends keyof C>(
		entities: EntitiesReadonly<C>,
		componentKeys: K[],
		enter: LifecycleEnter<C, K>
	) {

	const alive = new GMap<Id, LifecycleCallbacks<C, K>>()
	const sel = () => entities.select(...componentKeys)

	return <System<C>>function(commit: Commit<C>) {
		const current = new Map(sel())

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

