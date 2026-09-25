import {sub, Sub} from "@e280/stz"
import {EntityId} from "../types.js"
import {Code} from "../store/types.js"

export type OnBeforeChange = Sub<[id: EntityId, code?: Code]>

export const makeOnBeforeChange = (): OnBeforeChange => sub()

