
import {Parcel} from "../types.js"

export class Nanny {
	biggest: number = -1

	removeDuplicates = ([id]: Parcel<any>, _index: number, parcels: Parcel<any>[]) => {
		return !parcels.some(p => p[0] === id)
	}

	removeDisorderly = ([id]: Parcel<any>) => {
		if (id <= this.biggest)
			return false
		this.biggest = id
		return true
	}
}

