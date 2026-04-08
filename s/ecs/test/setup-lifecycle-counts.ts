
import {expect} from "@e280/science"

export function setupLifecycleCounts() {
	const counts = {
		enters: 0,
		ticks: 0,
		exits: 0,
		expect: (e: {enters: number, ticks: number, exits: number}) => {
			expect(counts.enters, `enters, expected ${e.enters}, got ${counts.enters}`)
				.is(e.enters)

			expect(counts.ticks, `ticks, expected ${e.ticks}, got ${counts.ticks}`)
				.is(e.ticks)

			expect(counts.exits, `exits, expected ${e.exits}, got ${counts.exits}`)
				.is(e.exits)
		},
	}
	return counts
}

