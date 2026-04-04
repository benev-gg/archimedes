
import {makeId} from "./make-id.js"
import {Components, ChangeSet, ChangeMerge, Id, ChangeKind, ChangeDrop} from "./types.js"

export const change = {
	create: (components: Partial<Components>): ChangeSet<Components> =>
		[ChangeKind.Set, makeId(), components],

	set: (id: Id, components: Partial<Components> | undefined): ChangeSet<Components> =>
		[ChangeKind.Set, id, components],

	delete: (id: Id): ChangeSet<Components> =>
		[ChangeKind.Set, id],

	merge: (id: Id, patch: Partial<Components>): ChangeMerge<Components> =>
		[ChangeKind.Merge, id, patch],

	drop: <C extends Components>(id: Id, ...keys: (keyof C)[]): ChangeDrop<C> =>
		[ChangeKind.Drop, id, keys],
}

