
import {Change} from "./change.js"
import {Entities} from "./entities.js"
import {applyDelta} from "./apply-delta.js"
import {Delta, Components, Systems} from "./types.js"

export function makeExecute<C extends Components>(
		entities: Entities<C>,
		systems: Systems<C>,
	) {

	let deltas: Delta<C>[] = []

	const change = new Change<C>(delta => {
		applyDelta(entities, delta)
		deltas.push(delta)
	})

	const fns = systems(change)

	return () => {
		for (const fn of fns)
			fn()
		const ret = deltas
		deltas = []
		return ret
	}
}

