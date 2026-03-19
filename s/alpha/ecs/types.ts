
export type Entities<C extends Components> = Map<Id, C>
export type Components = {[key: string]: unknown}
export type System = () => Generator<Change>

export type Id = string
export type AsComponents<C extends Components> = C
export type Change = [id: Id, components?: Partial<Components>]
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (id: Id, components: Select<C, K>) => void
	exit: (id: Id) => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

