
export class IdCounter {
	count: number

	constructor(start: number = 0) {
		this.count = start
	}

	next() {
		return this.count++
	}
}

