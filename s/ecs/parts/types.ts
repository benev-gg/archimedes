
export type Entities<C extends Components> = Map<Id, C>
export type Components = Record<string, unknown>
export type System = () => Generator<Change>

export type Id = string
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>

export enum Kind {Assign, Patch}
export type Delta<C extends Components> = Partial<{[K in keyof C]: C[K] | null}>
export type Assign = [id: Id, kind: Kind, components?: Partial<Components>]
export type Patch = [id: Id, kind: Kind, delta: Delta<Components>]
export type Change = Assign | Patch

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

