
import {Components, EntityId, EntityData} from "./types.js"

export class Entity<C extends Components = any> {
	static setComponents(entity: Entity, components: Components) {
		entity.#components = new Proxy(components, {
			set: (target: any, key: string, value: any) => {
				if (value === undefined) delete target[key]
				else target[key] = value
				entity.onChange()
				return true
			},
			deleteProperty: (target: any, key: string) => {
				delete target[key]
				entity.onChange()
				return true
			},
		})
		return entity.#components
	}

	#components!: C
	get components() { return this.#components }

	constructor(
		public readonly id: EntityId,
		private onChange: () => void,
	) {}

	write() {
		this.onChange()
	}

	data() {
		return [this.id, this.components] as EntityData<C>
	}
}

