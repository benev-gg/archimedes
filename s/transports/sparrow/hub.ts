
import {ConnectOptions, Sparrow, StdCable} from "sparrow-rtc"
import {Hub} from "../../session/parts/hub.js"
import {Spoke} from "../../session/parts/spoke.js"
import {netfibersFromCable} from "./utils/netfibers-from-cable.js"

export type HubSparrowOptions = Omit<ConnectOptions<StdCable>, "closed" | "welcome" | "cableConfig">

export async function sparrowHub(options: {
		closed: () => void
		sparrow?: HubSparrowOptions,
	}) {

	const hub = new Hub()

	const sparrow = await Sparrow.host({
		...(options.sparrow ?? {}),
		closed: options.closed,
		welcome: _prospect => connection => {
			const fibers = netfibersFromCable(connection.cable)
			const disconnect = () => connection.disconnect()
			const spoke = new Spoke(fibers, disconnect)
			return hub.invoke(spoke)
		},
	})

	return {sparrow, hub}
}

