
import {cycle, count} from "@e280/stz"

const maxTicksPerPass = 3

export function gameloop(hz: number, fn: () => (void | Promise<void>)) {
	const delta = 1000 / hz
	let last = performance.now()
	let bucket = 0

	return cycle(async() => {
		const now = performance.now()
		bucket += now - last

		const debt = Math.floor(bucket / delta)
		const ticks = Math.min(maxTicksPerPass, debt)

		for (const _ of count(ticks))
			await fn()

		last = now
		bucket -= debt * delta
		bucket = Math.max(0, bucket)
	})
}

