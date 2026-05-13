
export type Id = string
export type Components = Record<string, unknown>
export type AsComponents<C extends Components> = C
export type Select<C extends Components, K extends keyof C> = Pick<C, K> & Partial<C>

export type System<Context> = (context: Context) => () => void
export type SystemsBlueprint<Context> = System<Context> | {[key: string]: SystemsBlueprint<Context>}
export const asSystem = <Context>(fn: System<Context>) => fn
export const asSystemsBlueprint = <Context>(blueprint: SystemsBlueprint<Context>) => blueprint

export enum DeltaKind {Set, Merge, Drop}
export type DeltaSet<C extends Components> = [kind: DeltaKind.Set, id: Id, components?: Partial<C>]
export type DeltaMerge<C extends Components> = [kind: DeltaKind.Merge, id: Id, patch: Partial<C>]
export type DeltaDrop<C extends Components> = [kind: DeltaKind.Drop, id: Id, keys: (keyof C)[]]
export type Delta<C extends Components> = DeltaSet<C> | DeltaMerge<C> | DeltaDrop<C>

export type LifecycleCallbacks<C extends Components, K extends keyof C> = {
	tick: (components: Select<C, K>) => void
	exit: () => void
}

export type LifecycleEnter<C extends Components, K extends keyof C> = (
	(id: Id, components: Select<C, K>) => LifecycleCallbacks<C, K>
)

