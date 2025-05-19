
import {EntityId} from "../../parts/types.js"
import {AuthorId} from "../../../core/types.js"

export class Relevance {
	check(_authorId: AuthorId, _entityId: EntityId) {
		return true
	}
}

