
export type Entities<C extends Components> = Map<Id, C>
export type Components = Record<string, unknown>
export type System = () => Generator<Change>

export type Id = string
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>

export type Delta<C extends Components> = Partial<{[K in keyof C]: C[K] | null}>
export type Change = [id: Id, components?: Delta<Components>]

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

