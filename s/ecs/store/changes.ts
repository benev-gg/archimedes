
import {happy} from "@e280/stz"
import {Code, Store} from "./types.js"
import {Entities} from "../entities.js"
import {EntityId, Id} from "../types.js"
import {OnBeforeChange} from "../utils/before-change.js"

enum ChangeKind {Whole, Patch, Destroy}
enum ChangeOp {Set, Del}

type ChangeData = (
	| [ChangeKind.Whole, Id, valuesCount: number, ChangeWhole[]]
	| [ChangeKind.Patch, Id, valuesCount: number, ChangePatch[]]
	| [ChangeKind.Destroy, Id]
)

type ChangeWhole = (
	| [op: ChangeOp.Set, code: Code, data: Uint8Array]
	| [op: ChangeOp.Set, code: Code, dataLength: number, data: Uint8Array]
)

type ChangePatch = ChangeWhole | (
	| [op: ChangeOp.Del, code: Code]
)

export type Changes = Uint8Array

export function startRecordingChanges(
		entities: Entities<any>,
		onBeforeChange: OnBeforeChange,
		store: Store,
	) {

	const state = new Map<EntityId, Set<Code> | null>()

	const cancel = onBeforeChange((id, code) => {
		if (happy(code)) {
			if (!state.has(id)) state.set(id, new Set())
			state.get(id)?.add(code)
		}
		else {
			state.set(id, null)
		}
	})

	return {
		cancel,
		pack(): Changes {
			cancel()
			return new Uint8Array() // TODO
		},
	}
}

export function applyChanges(
		entities: Entities<any>,
		store: Store,
		changes: Changes,
	) {
	// TODO
}

