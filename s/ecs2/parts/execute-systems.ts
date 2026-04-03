
import {Entities} from "./entities.js"
import {applyChange} from "./apply-change.js"
import {Change, Components, System} from "./types.js"

export function executeSystems<C extends Components>(entities: Entities<C>, systems: System[]) {
	const changes: Change[] = []

	for (const system of systems) {
		for (const change of system()) {
			applyChange(entities, change)
			changes.push(change)
		}
	}

	return changes
}

