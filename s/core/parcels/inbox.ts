
import {Nanny} from "./utils/nanny.js"
import {Parcel, ParcelId} from "./types.js"
import {Averager} from "../../tools/averager.js"

/** inbox delays messages with a buffer time, and actively corrects for network packet jitter */
export class ParcelInbox<P> {
	#start: number
	#offsets: Averager
	#buffer = new Map<ParcelId, Parcel<P>>
	#nanny = new Nanny()

	constructor(
			public delay = 25,
			public smoothing = 5,
			private now = () => Date.now(),
		) {
		this.#start = now()
		this.#offsets = new Averager(smoothing)
	}

	/** put a parcel into this inbox */
	give(parcel: Parcel<P>) {
		const [id, time] = parcel
		if (this.#buffer.has(id)) return
		this.#buffer.set(id, parcel)
		this.#offsets.add(this.#offset(time))
	}

	/** extract all *available* parcels from this inbox */
	take(): P[] {
		const ready: Parcel<P>[] = []
		const localtime = this.#localtime

		for (const parcel of this.#buffer.values()) {
			const [id, time] = parcel

			// computing jitter corrective timings
			const offset = this.#offset(time, localtime)
			const abberation = offset - this.#offsets.average
			const correctedTime = (time + offset) - abberation
			const since = localtime - correctedTime

			// surface parcels that are 'ready' after jitter corrections
			if (since >= this.delay) {
				ready.push(parcel)
				this.#buffer.delete(id)

				// also surface any parcels that have a smaller id
				for (const parcelB of this.#buffer.values()) {
					const [idB] = parcelB
					if (idB < id) {
						ready.push(parcelB)
						this.#buffer.delete(idB)
					}
				}
			}
		}

		return ready
			.sort(sortById)
			.filter(this.#nanny.removeDuplicates)
			.filter(this.#nanny.removeDisorderly)
			.map(getPayload)
	}

	get #localtime() {
		return this.now() - this.#start
	}

	#offset(time: number, localtime = this.#localtime) {
		return localtime - time
	}
}

function getPayload<P>([,,payload]: Parcel<P>): P {
	return payload
}

function sortById([idA]: Parcel<any>, [idB]: Parcel<any>) {
	return idA - idB
}

