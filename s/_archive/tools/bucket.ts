
export class Bucket<T> {
	#items: T[] = []

	/** put an item in the bucket */
	give(item: T) {
		this.#items.push(item)
	}

	/** extract all items out of the bucket */
	take() {
		const items = this.#items
		this.#items = []
		return items
	}
}

