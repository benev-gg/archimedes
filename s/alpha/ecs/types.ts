
export type Entities<C extends Components> = Map<Id, Partial<C>>
export type Components = {[key: string]: unknown}
export type System = () => Generator<Change>

export type Id = string
export type AsComponents<C extends Components> = C
export type Change = [id: Id, components?: Partial<Components>]
export type Select<C extends Components, K extends keyof C> = {[P in K]: C[K]}

export type World<C extends Components> = {
	entities: Entities<C>
	select: <K extends keyof C>(...required: K[]) => Generator<[id: Id, components: Select<C, K>]>
	apply: ([id, components]: Change) => void
	execute: (systems: System[]) => Change[]
	create: (components: Partial<C>) => Change
	update: (id: Id, components: Partial<C>) => Change
	del: (id: Id) => Change
}

