
import {sub} from "@e280/stz"
import {Averager} from "../../tools/averager.js"
import {IdCounter} from "../../tools/id-counter.js"

export type Ping = ["ping", number]
export type Pong = ["pong", number]

type PingId = number
type Timestamp = number

export class Pingponger {
	onRtt = sub<[number]>()

	#rtt = 99
	#timeout = 3000
	#id = new IdCounter()
	#averager = new Averager(5)
	#pending = new Map<PingId, Timestamp>()

	constructor(public send: (p: Ping | Pong) => void) {}

	get latestRtt() {
		return this.#rtt
	}

	get averageRtt() {
		return this.#averager.average
	}

	ping() {
		const pingId = this.#id.next()
		const timestamp = Date.now()
		this.#pending.set(pingId, timestamp)
		this.send(["ping", pingId])
		this.#prune()
	}

	receive([kind, id]: Ping | Pong) {
		if (kind === "ping")
			this.send(["pong", id])

		else if (kind === "pong")
			this.#handlePong(id)

		else
			throw new Error(`unknown pingpong message kind: ${kind}`)
	}

	#handlePong(pingId: number) {
		const timestamp = this.#pending.get(pingId)

		if (timestamp === undefined)
			return

		const now = Date.now()
		this.#rtt = now - timestamp
		this.#averager.add(this.#rtt)

		this.#pending.delete(pingId)
		this.onRtt.pub(this.#rtt)
	}

	#prune() {
		const now = Date.now()
		for (const [pingId, timestamp] of this.#pending) {
			if ((now - timestamp) > this.#timeout)
				this.#pending.delete(pingId)
		}
	}
}

