
import {expect} from "@e280/science"

export function setupLifecycleCounts() {
	const counts = {
		enters: 0,
		ticks: 0,
		exits: 0,
		expect: (enters: number, ticks: number, exits: number) => {
			expect(counts.enters).is(enters)
			expect(counts.ticks).is(ticks)
			expect(counts.exits).is(exits)
		},
	}
	return counts
}

