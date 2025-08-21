
import {Parcel} from "../types.js"

export class Nanny {
	biggest: number = -1

	removeDuplicates = ([idA]: Parcel<any>, _index: number, parcels: Parcel<any>[]) => {
		let count = 0
		for (const [idB] of parcels) {
			if (idB === idA) count += 1
			if (count > 1) return false
		}
		return true
	}

	removeDisorderly = ([id]: Parcel<any>) => {
		if (id <= this.biggest)
			return false
		this.biggest = id
		return true
	}
}

