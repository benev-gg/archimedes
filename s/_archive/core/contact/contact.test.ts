
import {coalesce} from "@e280/stz"
import {Science, test, expect, spy} from "@e280/science"

import {Contact} from "./contact.js"
import {wiring} from "./wiring.i.js"

export default Science.suite({
	"binary exchange": test(async() => {
		const alice = new Contact<string, number>()
		const bob = new Contact<Uint8Array>()
		const charlie = new Contact<Uint8Array>()
		const debbie = new Contact<number, string>()

		const stop = coalesce(
			wiring.relayBinary(alice, bob),
			wiring.relayBinary(debbie, charlie),
			wiring.exchange(bob, charlie),
		)

		const debbieRecv = spy((_: number) => {})
		debbie.recv.on(debbieRecv)
		expect(debbieRecv.spy.calls.length).is(0)

		alice.send(123, true)
		expect(debbieRecv.spy.calls.length).is(1)
		expect(debbieRecv.spy.calls.at(0)!.args[0]).is(123)

		stop()
	}),
})

