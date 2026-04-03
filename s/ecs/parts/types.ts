
export type Id = string
export type Components = Record<string, unknown>
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>
export type System = () => Generator<Change>

export enum ChangeKind {Assign, Patch}
export type ChangeDelta<C extends Components> = Partial<{[K in keyof C]: C[K] | null}>
export type ChangeAssign = [kind: ChangeKind, id: Id, components?: Partial<Components>]
export type ChangePatch = [kind: ChangeKind, id: Id, delta: ChangeDelta<Components>]
export type Change = ChangeAssign | ChangePatch

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

