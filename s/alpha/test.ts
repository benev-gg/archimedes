
import {suite, test, expect} from "@e280/science"
import {AsComponents, newEntity, makeWorld} from "./sketch.js"

export default suite({
	"create an entity": test(async() => {
		type MyComponents = AsComponents<{mana: number, regen: number}>
		const {entities, apply} = makeWorld<MyComponents>()
		expect(entities.size).is(0)
		apply([newEntity({mana: 0, regen: 1})])
		expect(entities.size).is(1)
	}),

	"execute systems to effect change": test(async() => {
		type MyComponents = AsComponents<{mana: number, regen: number}>
		const {entities, apply, select, execute} = makeWorld<MyComponents>()
		const wizard = newEntity({mana: 0, regen: 1})
		apply([wizard])
		const changes = execute([
			function *manaRegen() {
				for (const [id, c] of select("mana", "regen")) {
					if (c.regen !== 0)
						yield [id, {...c, mana: c.mana + c.regen}]
				}
			},
		])
		const [wizardId] = wizard
		expect(changes.length).is(1)
		expect(entities.require(wizardId).mana).is(1)
	}),
})

