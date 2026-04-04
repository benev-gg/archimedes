
import {makeId} from "./make-id.js"
import {Components, ChangeSet, ChangeMerge, Id, ChangeKind, ChangeDrop} from "./types.js"

export const change = {

	/** create a new entity with the given components */
	create: (components: Partial<Components>): ChangeSet<Components> =>
		[ChangeKind.Set, makeId(), components],

	/** overwrite a whole entity to the given components */
	set: (id: Id, components: Partial<Components>): ChangeSet<Components> =>
		[ChangeKind.Set, id, components],

	/** remove the entity */
	delete: (id: Id): ChangeSet<Components> =>
		[ChangeKind.Set, id],

	/** update or add the given components onto the entity */
	merge: (id: Id, components: Partial<Components>): ChangeMerge<Components> =>
		[ChangeKind.Merge, id, components],

	/** delete specific components off the entity */
	drop: <C extends Components>(id: Id, ...keys: (keyof C)[]): ChangeDrop<C> =>
		[ChangeKind.Drop, id, keys],
}

