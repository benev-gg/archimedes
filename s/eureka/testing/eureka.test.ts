
import {Science, test, expect} from "@e280/science"
import {setupHealthSituation} from "./situations/health.js"

export default Science.suite({

	"systems can execute on the right entities": test(async() => {
		const {assembly} = setupHealthSituation()
		const warrior = assembly.create({health: 100, bleeding: 1})
		const wizard = assembly.create({health: 100, mana: 0, manaRegen: 1})
		expect(warrior.components.health).is(100)
		expect(wizard.components.health).is(100)
		assembly.execute()
		expect(warrior.components.health).is(99)
		expect(wizard.components.health).is(100)
	}),

	"warrior can bleed out, gets deleted": test(async() => {
		const {assembly} = setupHealthSituation()
		const warrior = assembly.create({health: 2, bleeding: 1})
		expect(assembly.get(warrior.id)).ok()
		assembly.execute()
		expect(assembly.get(warrior.id)).ok()
		assembly.execute()
		expect(assembly.get(warrior.id)).not.ok()
	}),
})

