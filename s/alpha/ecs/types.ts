
export type Entities<C extends Components> = Map<Id, Partial<C>>
export type Components = {[key: string]: unknown}
export type System = () => Generator<Change>

export type Id = string
export type AsComponents<C extends Components> = C
export type Change = [id: Id, components?: Partial<Components>]
export type Select<C extends Components, K extends keyof C> = {[P in K]: C[K]}

