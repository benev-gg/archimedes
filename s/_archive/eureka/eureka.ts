
import {World} from "./parts/world.js"
import {System} from "./parts/system.js"
import {Components, SystemFn} from "./parts/types.js"

export const setupEureka = <Context, C extends Components>() => ({
	system: (label: string) => ({
		select: <K extends keyof C>(...keys: K[]) => ({
			fn: (fn: SystemFn<Context, C, K, undefined>) => new System(label, keys, [], fn),
			andMaybe: <K2 extends keyof C>(...keysOptional: K2[]) => ({
				fn: (fn: SystemFn<Context, C, K, K2>) => new System(label, keys, keysOptional, fn),
			}),
		}),
	}),

	world: (context: Context, systems: System[]) => (
		new World<Context, C>(context, systems)
	),
})

