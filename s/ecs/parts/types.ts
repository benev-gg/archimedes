
import {Change} from "./change.js"
import {EntitiesReadonly} from "./entities.js"

export type Id = string
export type Components = Record<string, unknown>
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>

export enum DeltaKind {Set, Merge, Drop}
export type DeltaSet<C extends Components> = [kind: DeltaKind.Set, id: Id, components?: Partial<C>]
export type DeltaMerge<C extends Components> = [kind: DeltaKind.Merge, id: Id, patch: Partial<C>]
export type DeltaDrop<C extends Components> = [kind: DeltaKind.Drop, id: Id, keys: (keyof C)[]]
export type Delta<C extends Components> = DeltaSet<C> | DeltaMerge<C> | DeltaDrop<C>

export type System<C extends Components> = (entities: EntitiesReadonly<C>, change: Change<C>) => void
export const asSystem = <C extends Components>(system: System<C>) => system
export const asSystems = <C extends Components>(...systems: System<C>[]) => systems

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>, change: Change<C>) => LifecycleCallbacks<C, K>
)

