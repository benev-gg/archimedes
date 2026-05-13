
import {System, Systems} from "../types.js"

export function consolidate<Context>(context: Context, blueprint: Systems<Context>) {
	const fns = flatten(blueprint).map(fn => fn(context))
	return () => fns.forEach(fn => fn())
}

function flatten<Context>(blueprint: Systems<Context>) {
	const systems: System<Context>[] = []

	void function crawl(value: Systems<Context>) {
		if (typeof value === "function") systems.push(value)
		else Object.values(value).forEach(crawl)
	}(blueprint)

	return systems
}

