
import {MapG} from "@e280/stz"
import {InputEntry} from "../types.js"
import {EntityId} from "../../parts/types.js"

export class Inputs {
	#inbox = new MapG<EntityId, unknown[]>()

	add(entries: InputEntry[]) {
		for (const [id, newInputs] of entries) {
			const inputs = this.#inbox.guarantee(id, () => [])
			inputs.push(...newInputs)
		}
	}

	read<Input = unknown>(id: EntityId) {
		return (this.#inbox.get(id) ?? []) as Input[]
	}

	clear() {
		this.#inbox.clear()
	}
}

