
import {Entities} from "./entities.js"
import {applyChange} from "./apply-change.js"
import {Change, Components, System} from "./types.js"

export function executeSystems<C extends Components>(entities: Entities<C>, systems: System<C>[]) {
	const allChanges: Change<C>[] = []

	function commit(...localChanges: Change<C>[]) {
		for (const change of localChanges) {
			applyChange(entities, change)
			allChanges.push(change)
		}
	}

	for (const system of systems)
		system(entities.readonly(), commit)

	return allChanges
}

