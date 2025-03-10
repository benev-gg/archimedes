
import {setupEureka} from "../../eureka.js"
import {Hub} from "../../../session/parts/hub.js"
import {Fiber} from "../../../core/parts/fiber.js"
import {SessionHost} from "../../../session/host.js"
import {Spoke} from "../../../session/parts/spoke.js"
import {SessionClient} from "../../../session/client.js"
import {EurekaContext} from "../../integration/context.js"
import {Netfibers} from "../../../session/parts/netfibers.js"
import {EurekaSimulator} from "../../integration/simulator.js"

export class MyContext extends EurekaContext {}

export type MyComponents = {
	health: number
	bleeding: number
	mana: number
	manaRegen: number
}

export async function setupIntegrationSituation() {
	const tickRateHz = 10

	const hostFibers = new Netfibers()
	const clientFibers = new Netfibers()
	Fiber.entangle(hostFibers.megafiber, clientFibers.megafiber)
	const hostSpoke = new Spoke(hostFibers, () => {})
	const clientSpoke = new Spoke(clientFibers, () => {})

	const hub = new Hub()
	const host = new SessionHost<EurekaSimulator<MyContext, MyComponents>>({
		hub,
		simulator: setupSimulator(),
	})
	hub.invoke(hostSpoke)

	const client = await SessionClient.make({
		hz: tickRateHz,
		spoke: clientSpoke,
		pastSimulator: setupSimulator(),
		futureSimulator: setupSimulator(),
	})


	// TODO
}

function setupSimulator() {
	const {assembly} = setupEurekaParts()
	return new EurekaSimulator<MyContext, MyComponents>(assembly, [])
}

function setupEurekaParts() {
	const eureka = setupEureka<MyContext, MyComponents>()
	const context = new MyContext()
	const assembly = eureka.assembly(context, [

		eureka.system("health")
			.select("health").andMaybe("bleeding")
			.fn((entities, assembly) => {
				for (const {id, components} of entities) {

					// process bleeding
					if (components.bleeding)
						components.health -= components.bleeding

					// process death
					if (components.health <= 0)
						assembly.delete(id)
				}
			}),

		eureka.system("mana")
			.select("mana").andMaybe("manaRegen")
			.fn((entities, _assembly) => {
				for (const {components} of entities)
					if (components.manaRegen)
						components.mana += components.manaRegen
			}),

	])
	return {assembly}
}

