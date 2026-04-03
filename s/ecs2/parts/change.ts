
import {Components, ChangeAssign, ChangePatch, ChangeDelta, Id, ChangeKind} from "./types.js"
import {makeId} from "./make-id.js"

export const change = {
	create: <C extends Components>(components: Partial<C>): ChangeAssign =>
		[ChangeKind.Assign, makeId(), components],

	assign: <C extends Components>(id: Id, components: Partial<C> | undefined): ChangeAssign =>
		[ChangeKind.Assign, id, components],

	delete: (id: Id): ChangeAssign =>
		[ChangeKind.Assign, id],

	patch: <C extends Components>(id: Id, delta: ChangeDelta<C>): ChangePatch =>
		[ChangeKind.Patch, id, delta],
}

