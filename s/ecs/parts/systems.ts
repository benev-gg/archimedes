
import {System, SystemsBlueprint} from "./types.js"

export function crawlSystems<Context>(blueprint: SystemsBlueprint<Context>) {
	const systems: System<Context>[] = []
	void function crawl(value: SystemsBlueprint<Context>) {
		if (typeof value === "function") systems.push(value)
		else Object.values(value).forEach(crawl)
	}(blueprint)
	return systems
}

export function consolidateSystems<Context>(
		context: Context,
		blueprint: SystemsBlueprint<Context>,
	) {
	const systems = crawlSystems(blueprint)
	const fns = systems.map(fn => fn(context))
	return () => fns.forEach(fn => fn())
}

