
import {makeId} from "./make-id.js"
import {Components, Id, DeltaKind, Delta} from "../types.js"

export class Change<C extends Components> {
	constructor(private commit: (delta: Delta<C>) => void) {}

	/** create a new entity with the given components */
	create(components: Partial<C>) {
		const id = makeId()
		this.commit([DeltaKind.Set, id, components])
		return id
	}

	/** overwrite a whole entity to the given components */
	set(id: Id, components: Partial<C>) {
		this.commit([DeltaKind.Set, id, components])
		return id
	}

	/** remove the entity */
	delete(id: Id) {
		this.commit([DeltaKind.Set, id])
		return id
	}

	/** update or add the given components onto the entity */
	merge(id: Id, components: Partial<C>) {
		this.commit([DeltaKind.Merge, id, components])
		return id
	}

	/** delete specific components off the entity */
	drop(id: Id, ...keys: (keyof C)[]) {
		this.commit([DeltaKind.Drop, id, keys])
		return id
	}
}

