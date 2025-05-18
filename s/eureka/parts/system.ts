
import {MapG} from "@e280/stz"
import {Entity} from "./entity.js"
import {World} from "./world.js"
import {SystemFn, UnknownComponents} from "./types.js"

export class System {
	#cacheMap = new MapG<number, Entity>()
	#cacheArray: Entity[] = []

	constructor(
		public label: string,
		public keys: any[],
		public keysOptional: any[],
		public fn: SystemFn<any, any, any, any>,
	) {}

	execute(world: World<any, any>) {
		this.fn(this.#cacheArray, world)
	}

	cache(id: number, entity: Entity | null) {
		if (entity) {
			if (this.#matching(entity)) this.#cacheMap.set(id, entity)
			else this.#cacheMap.delete(id)
			this.#cacheArray = [...this.#cacheMap.values()]
		}
		else {
			this.#cacheMap.delete(id)
			this.#cacheArray = [...this.#cacheMap.values()]
		}
	}

	#matching(entity: UnknownComponents) {
		return this.keys.every(requiredKey => requiredKey in entity.components)
	}
}

