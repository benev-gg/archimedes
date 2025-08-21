
import {Ping, Pingponger, Pong} from "@e280/renraku"
import {AuthorId} from "./types.js"
import {Fiber} from "./fiber.js"
import {Bucket} from "../tools/bucket.js"
import {Parcel} from "./parcels/types.js"
import {ParcelInbox} from "./parcels/inbox.js"
import {Parceller} from "./parcels/parceller.js"

export type Datagram<Data> = ["data", Data]

export type Mail<Data> = (
	| Ping
	| Pong
	| ["data", Data]
)

export class Liaison<Data> {
	pingponger: Pingponger
	inbox = new ParcelInbox<Mail<Data>>()
	parceller = new Parceller<Mail<Data>>()
	outbox = new Bucket<Parcel<Mail<Data>>>()

	constructor(
			/** author id of the remote partner (it's their id, not ours) */
			public authorId: AuthorId,

			public fiber: Fiber<Parcel<Mail<Data>>[]>,
		) {

		this.pingponger = new Pingponger({
			timeout: 60_000,
			send: p => {
				const parcel = this.parceller.wrap(p)
				fiber.unreliable.send([parcel])
			},
		})

		const handleIncoming = (parcels: Parcel<Mail<Data>>[]) => parcels.forEach(
			parcel => this.inbox.give(parcel)
		)

		this.fiber.reliable.recv.on(handleIncoming)
		this.fiber.unreliable.recv.on(handleIncoming)
	}

	queue(data: Data) {
		const parcel = this.parceller.wrap(["data", data])
		this.outbox.give(parcel)
	}

	send(data?: Data) {
		const parcels = this.outbox.take()
		if (data) parcels.push(this.parceller.wrap(["data", data]))
		this.fiber.unreliable.send(parcels)
	}

	recv() {
		const datas: Data[] = []
		for (const message of this.inbox.take()) {
			switch (message[0]) {
				case "ping":
				case "pong":
					this.pingponger.recv(message)
					break
				default:
					datas.push(message[1])
			}
		}
		return datas
	}
}

