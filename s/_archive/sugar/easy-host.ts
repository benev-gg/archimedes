
import {sub} from "@e280/stz"
import {Ticker} from "../tools/ticker.js"
import {Hub} from "../session/parts/hub.js"
import {Fiber} from "../core/fiber.js"
import {Simulator} from "../core/simulator.js"
import {SessionHost} from "../session/host.js"
import {Spoke} from "../session/parts/spoke.js"
import {SessionClient} from "../session/client.js"
import {Netfibers} from "../session/parts/netfibers.js"
import {HubSparrowOptions, startSparrowHost} from "../transports/sparrow/start-sparrow-host.js"

export type EasyHostOptions<xSimulator extends Simulator> = {
	hz: number
	makeSimulator: () => xSimulator,
	closed?: () => void
	sparrow?: HubSparrowOptions
}

export class EasyHost<xSimulator extends Simulator> {
	hub = new Hub()
	onClosed = sub()

	session: SessionHost<xSimulator>
	ticker: Ticker

	constructor(public options: EasyHostOptions<xSimulator>) {
		this.session = new SessionHost<xSimulator>(this.hub, options.makeSimulator())
		this.ticker = this.session.authority.makeTicker(options.hz)
	}

	async startHostingViaSparrow(sparrow?: HubSparrowOptions) {
		return startSparrowHost({
			sparrow,
			hub: this.hub,
			closed: () => this.onClosed.pub(),
		})
	}

	async localClient() {
		// establish fibers on both sides
		const fibers = {
			host: new Netfibers(),
			client: new Netfibers(),
		}

		// entangle the host and client fibers
		Fiber.entangle(fibers.host.megafiber, fibers.client.megafiber)

		// create spokes
		const spokes = {
			host: new Spoke(fibers.host, () => {}),
			client: new Spoke(fibers.client, () => {}),
		}

		// add the host-side spoke the host hub
		this.hub.addSpoke(spokes.host)

		// create a session client using the client spoke
		return SessionClient.make<xSimulator>({
			hz: this.options.hz,
			spoke: spokes.client,
			pastSimulator: this.options.makeSimulator(),
			futureSimulator: this.options.makeSimulator(),
		})
	}
}

