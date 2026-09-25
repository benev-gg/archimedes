
import {System, Systems} from "./types.js"

export function consolidateSystems<Context>(systems: Systems<Context>): System<Context> {
	return context => {
		const fns = flattenSystems(systems).map(s => s(context))
		return () => fns.forEach(fn => fn())
	}
}

function flattenSystems<Context>(blueprint: Systems<Context>) {
	const systems: System<Context>[] = []

	void function crawl(value: Systems<Context>) {
		if (typeof value === "function") systems.push(value)
		else Object.values(value).forEach(crawl)
	}(blueprint)

	return systems
}

