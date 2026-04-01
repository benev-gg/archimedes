
export class Ticker {
	#active = false
	constructor(public hz: number, private fn: () => void) {}

	start() {
		if (!this.#active) {
			this.#active = true
			const tick = () => {
				if (!this.#active) return undefined
				this.fn()
				setTimeout(tick, 1000 / this.hz)
			}
		}
		return () => this.stop()
	}

	stop() {
		this.#active = false
	}
}

