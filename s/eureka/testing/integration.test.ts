
import {loop} from "@e280/stz"
import {Science, test, expect} from "@e280/science"

import {EasyHost} from "../../sugar/easy-host.js"
import {setupEurekaDemo} from "./situations/integration.js"
import {EurekaSimulator} from "../integration/simulator.js"

export default Science.suite({

	"we host a game, we join it": test(async() => {
		const host = new EasyHost({
			hz: 10,
			makeSimulator: () => {
				const {world} = setupEurekaDemo()
				return new EurekaSimulator(world)
			},
		})
		const client = await host.localClient()

		const {world} = host.session.simulator
		const warrior = world.create({health: 100, bleeding: 1})

		for (const _ of loop(50)) {
			host.session.authority.tick()
			client.speculator.tick()
		}

		expect(warrior.components.health).is(50)

		// FAILS HERE, component not found
		const clientWarrior = client.pastSimulator.world
			.require<typeof warrior.components>(warrior.id)

		expect(clientWarrior).ok()
		expect(clientWarrior.health).is(50)
	}),
})

