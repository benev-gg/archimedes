
import {SessionHost} from "../session/host.js"
import {setupEureka} from "../eureka/eureka.js"
import {World} from "../eureka/parts/world.js"
import {EurekaContext} from "../eureka/integration/context.js"
import {EurekaSimulator} from "../eureka/integration/simulator.js"
import {Components, EntityData} from "../eureka/parts/types.js"
import {HubSparrowOptions, sparrowHub} from "../transports/sparrow/hub.js"

export async function easyHost<xContext extends EurekaContext, xComponents extends Components>(options: {
		hz: number
		sparrow?: HubSparrowOptions
		closed?: () => void
		setup: (e: ReturnType<typeof setupEureka<xContext, xComponents>>) => {
			world: World<xContext, xComponents>
			initialState: EntityData<xComponents>[]
		}
	}) {

	const {world, initialState} = options.setup(setupEureka())
	const simulator = new EurekaSimulator<xContext, xComponents>(world, initialState)

	const {hub, sparrow} = await sparrowHub({
		closed: options.closed ?? (() => {}),
		sparrow: options.sparrow,
	})

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

