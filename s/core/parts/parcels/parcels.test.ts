
import {Science, test, expect} from "@e280/science"
import {ParcelInbox} from "./inbox.js"
import {Parceller} from "./parceller.js"
import {loop} from "../../../tools/loop.js"

export default Science.suite({

	"one parcel": test(async() => {
		let now = 0
		const outbox = new Parceller<string>(() => now)
		const inbox = new ParcelInbox<string>(100, 20, () => now)
		const parcel = outbox.wrap("hello")
		inbox.give(parcel)
		now = 1000
		const payloads = inbox.take()
		expect(payloads.length).is(1)
		expect(payloads.at(0)).is("hello")
	}),

	"many parcels": test(async() => {
		let now = 0
		const outbox = new Parceller<string>(() => now)
		const inbox = new ParcelInbox<string>(100, 20, () => now)
		const parcels = [...loop(100)].map(_ => {
			now++
			return outbox.wrap("a")
		})
		parcels.forEach(parcel => {
			now++
			inbox.give(parcel)
		})
		now = 1000
		const payloads = inbox.take()
		expect(payloads.length).is(100)
	}),

	"out of order packets are corrected": test(async() => {
		let now = 0
		const outbox = new Parceller<string>(() => now)
		const inbox = new ParcelInbox<string>(100, 20, () => now)

		const a = [...loop(10)].map(() => {
			now += 1
			return outbox.wrap("a")
		})

		const b = [...loop(10)].map(() => {
			now += 1
			return outbox.wrap("b")
		})

		const c = [...loop(10)].map(() => {
			now += 1
			return outbox.wrap("c")
		})

		// out of order
		const parcels = [...b, ...a, ...c]

		now = 100
		parcels.forEach(parcel => {
			now += 1
			inbox.give(parcel)
		})

		now = 300
		const payloads = inbox.take()
		expect(payloads.length).is(30)
		expect(payloads.at(5)).is("a")
		expect(payloads.at(15)).is("b")
		expect(payloads.at(25)).is("c")
	}),

	"literally do the buffering": test(async() => {
		let now = 0
		const outbox = new Parceller<string>(() => now)
		const inbox = new ParcelInbox<string>(100, 20, () => now)

		const parcels = [...loop(20)].map(() => {
			now++
			return outbox.wrap("a")
		})

		now = 400
		for (const parcel of parcels) {
			now++
			inbox.give(parcel)
		}

		expect(inbox.take().length).is(0)

		now = 510
		expect(inbox.take().length).is(10)

		now = 520
		expect(inbox.take().length).is(10)

		now = 600
		expect(inbox.take().length).is(0)
	}),

	"specific abberation/jitter adjustment": test(async() => {
		let now = 0
		const outbox = new Parceller<string>(() => now)
		const inbox = new ParcelInbox<string>(100, 20, () => now)

		now = 100 // many parcels at once, establishes an average
		const a = [...loop(20)].map(() => outbox.wrap("a"))

		now = 110 // one special parcel at a different time
		const b = outbox.wrap("b")

		//////

		// ingest most of the parcels at this time
		now = 200
		a.forEach(p => inbox.give(p))

		// except our one special parcel will be particularly late
		now = 275 // late!
		inbox.give(b)

		//////

		// the first 20 should be available by now
		now = 309
		expect(inbox.take().length).is(20)

		// the last special one should have been moved earlier,
		// thus available by now
		now = 320
		expect(inbox.take().length).is(1)
	}),
})

