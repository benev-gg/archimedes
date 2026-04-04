
export type Id = string
export type Components = Record<string, unknown>
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>
export type System<C extends Components> = () => Generator<Change<C>>

export const asSystem = <C extends Components>(system: System<C>) => system
export const asSystems = <C extends Components>(...systems: System<C>[]) => systems

export enum ChangeKind {Set, Merge, Drop}
export type ChangeSet<C extends Components> = [kind: ChangeKind.Set, id: Id, components?: Partial<C>]
export type ChangeMerge<C extends Components> = [kind: ChangeKind.Merge, id: Id, patch: Partial<C>]
export type ChangeDrop<C extends Components> = [kind: ChangeKind.Drop, id: Id, keys: (keyof C)[]]
export type Change<C extends Components> = ChangeSet<C> | ChangeMerge<C> | ChangeDrop<C>

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

