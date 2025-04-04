
import {Hub} from "../session/parts/hub.js"
import {Fiber} from "../core/parts/fiber.js"
import {SessionHost} from "../session/host.js"
import {Spoke} from "../session/parts/spoke.js"
import {setupEureka} from "../eureka/eureka.js"
import {Assembly} from "../eureka/parts/assembly.js"
import {Netfibers} from "../session/parts/netfibers.js"
import {EurekaContext} from "../eureka/integration/context.js"
import {EurekaSimulator} from "../eureka/integration/simulator.js"
import {Components, PartialEntityEntry} from "../eureka/parts/types.js"

export async function localLoop<xContext extends EurekaContext, xComponents extends Components>(options: {
		hz: number
		closed?: () => void
		setup: (e: ReturnType<typeof setupEureka<xContext, xComponents>>) => {
			assembly: Assembly<xContext, xComponents>
			initialState: PartialEntityEntry<xComponents>[]
		}
	}) {

	const {hub, hostSpoke, clientSpoke} = createNetworking()

	const {assembly, initialState} = options.setup(setupEureka())
	const simulator = new EurekaSimulator<xContext, xComponents>(assembly, initialState)

	// const {hub, sparrow} = await sparrowHub({
	// 	closed: options.closed ?? (() => {}),
	// 	sparrow: options.sparrow,
	// })

	const host = new SessionHost({
		hub,
		simulator,
	})

	return {
		host,
		sparrow,
		ticker: host.authority.makeTicker(options.hz)
	}
}

class LocalNetworking {
	hub = new Hub()

	connect() {
		const hostside = {}
		const fibers = {
			host: new Netfibers(),
			client: new Netfibers(),
		}
		Fiber.entangle(fibers.host.megafiber, fibers.client.megafiber)
		const spokes = {
			host: new Spoke(fibers.host, () => {}),
			client: new Spoke(fibers.client, () => {}),
		}
		return {fibers, spokes}
	}
}

function createNetworking() {
	const hostFibers = new Netfibers()
	const clientFibers = new Netfibers()
	Fiber.entangle(hostFibers.megafiber, clientFibers.megafiber)

	const hostSpoke = new Spoke(hostFibers, () => {})
	const clientSpoke = new Spoke(clientFibers, () => {})

	const hub = new Hub()

	return {hub, hostSpoke, clientSpoke}
}

