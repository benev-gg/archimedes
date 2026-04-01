
import {Parcel} from "./types.js"

/** facility for wrapping messages into parcels that are ready to be handled by an inbox */
export class Parceller<P> {
	#id = 0
	#start: number

	constructor(private now = () => Date.now()) {
		this.#start = now()
	}

	/** parcelize a payload (wrap it into a parcel) */
	wrap(payload: P): Parcel<P> {
		const id = this.#id++
		const time = this.now() - this.#start
		return [id, time, payload]
	}
}

