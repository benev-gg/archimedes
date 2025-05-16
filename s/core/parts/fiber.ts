
import {StdCable} from "sparrow-rtc"
import {encode, decode} from "@msgpack/msgpack"

import {pub} from "../../tools/pub.js"
import {disposers} from "../../tools/disposers.js"
import {onChannelMessage} from "../utils/on-channel-message.js"

/** an arbitrary data channel */
export class Bicomm<I, O = I> {
	send = pub<[O]>()
	recv = pub<[I]>()
}

/** infer a fiber's input data type */
export type FiberInput<F extends Fiber<any>> = (
	F extends Fiber<infer M>
		? M
		: never
)

/** a virtualized cable */
export class Fiber<I = any, O = I> {
	reliable = new Bicomm<I, O>()
	unreliable = new Bicomm<I, O>()

	/** this fiber becomes a proxy of the cable */
	entangleCable(cable: StdCable) {
		this.reliable.send.on(output => cable.reliable.send(encode(output)))
		this.unreliable.send.on(output => cable.unreliable.send(encode(output)))
		return disposers(
			onChannelMessage(cable.reliable, input => this.reliable.recv(decode(input) as I)),
			onChannelMessage(cable.unreliable, input => this.unreliable.recv(decode(input) as I)),
		)
	}

	/** create a fiber as a proxy to the given cable */
	static fromCable<I = any, O = I>(cable: StdCable) {
		const fiber = new Fiber<I, O>()
		fiber.entangleCable(cable)
		return fiber
	}

	/** weld two fibers together: messages sent to one are received by the other */
	static entangle<M>(alice: Fiber<M>, bob: Fiber<M>) {
		return disposers(
			alice.reliable.send.on(m => bob.reliable.recv(m)),
			alice.unreliable.send.on(m => bob.unreliable.recv(m)),
			bob.reliable.send.on(m => alice.reliable.recv(m)),
			bob.unreliable.send.on(m => alice.unreliable.recv(m)),
		)
	}

	/** create two fibers that are entangled together: messages sent to one are received by the other */
	static makeEntangledPair<M>() {
		const alice = new this<M>()
		const bob = new this<M>()
		const detangle = this.entangle<M>(alice, bob)
		return [alice, bob, detangle] as [Fiber<M>, Fiber<M>, () => void]
	}

	/** roll multiple subfibers into a single megafiber */
	static multiplex<C extends {[key: string]: Fiber}>(fibers: C) {
		const megafiber = new Fiber<{[K in keyof C]: [K, FiberInput<C[K]>]}[keyof C]>()

		for (const [key, subfiber] of Object.entries(fibers)) {
			subfiber.reliable.send.on(x => megafiber.reliable.send([key, x]))
			subfiber.unreliable.send.on(x => megafiber.unreliable.send([key, x as any]))
		}

		megafiber.reliable.recv.on(([key, data]) => {
			const subfiber = fibers[key as any]
			if (!subfiber) throw new Error(`unknown subfiber "${key as any}"`)
			subfiber.reliable.recv(data as any)
		})

		megafiber.unreliable.recv.on(([key, data]) => {
			const subfiber = fibers[key as any]
			if (!subfiber) throw new Error(`unknown subfiber "${key as any}"`)
			subfiber.unreliable.recv(data as any)
		})

		return megafiber
	}
}

