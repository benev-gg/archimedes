
import {Component, Components} from "../types.js"

export function sortComponents(components: Components): [name: string, component: Component][] {
	return Object.entries(components).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
}

