
import {Sparrow} from "sparrow-rtc"
import {netfibersFromCable} from "./utils/netfibers-from-cable.js"

export async function sparrowFibers(options: {
		invite: string,
		disconnected: () => void,
	}) {

	const sparrow = await Sparrow.join({
		invite: options.invite,
		disconnected: options.disconnected,
	})

	const fibers = netfibersFromCable(sparrow.connection.cable)

	return {sparrow, fibers}
}

