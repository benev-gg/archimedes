
import {sub} from "@e280/stz"
import {Seat} from "./seat.js"

export class ClientOn {
	disconnected = sub<[Seat]>()
}

