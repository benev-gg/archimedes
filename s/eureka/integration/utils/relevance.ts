
import {MapG} from "@e280/stz"
import {EntityId} from "../../parts/types.js"
import {AuthorId} from "../../../core/types.js"

export class Relevance {
	#authors = new MapG<AuthorId, Set<EntityId>>()

	author(id: AuthorId) {
		return this.#authors.guarantee(id, () => new Set())
	}
}

