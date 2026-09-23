
import {Entities} from "../entities.js"
import {Entity, EntityId} from "../types.js"

export function startRollback(entities: Entities<any>) {
	const oldies = new Map<EntityId, Partial<Entity<any>> | undefined>()

	const stopListening = entities.beforeChange(([id]) => {
		if (!oldies.has(id))
			oldies.set(id, entities.get(id))
	})

	return {
		revert: () => {
			stopListening()
			for (const [id, was] of oldies) {
				if (was === undefined) entities.delete(id)
				else entities.set(id, was)
			}
		},
		cancel: stopListening,
	}
}

