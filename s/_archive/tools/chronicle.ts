
export type Chron<X> = {item: X, time: number}

export class Chronicle<X> {
	#chrons: Chron<X>[] = []

	constructor(public limit = 100) {}

	add(item: X, time: number) {
		this.#chrons.push({item, time})
		this.#limit()
	}

	at(time: number) {
		return this.#chrons
			.filter(chron => chron.time === time)
			.map(chron => chron.item)
	}

	since(time: number) {
		return this.#chrons
			.filter(chron => chron.time > time)
			.map(chron => chron.item)
	}

	#limit() {
		const {limit} = this
		while (this.#chrons.length > limit)
			this.#chrons.shift()
	}
}

