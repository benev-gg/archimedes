
import {sub} from "@e280/stz"
import {Seat} from "./seat.js"

export class HostOn {
	seated = sub<[Seat]>()
	unseated = sub<[Seat]>()
}

