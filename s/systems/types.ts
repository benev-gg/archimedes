
export type System<Context> = (context: Context) => () => void

export type Systems<Context> =
	| System<Context>
	| {[key: string]: Systems<Context>}

export const asSystem = <Context>(s: System<Context>) => s
export const asSystems = <Context>(s: Systems<Context>) => s

