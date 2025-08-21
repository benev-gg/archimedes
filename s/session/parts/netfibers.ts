
import {JsonRpc} from "@e280/renraku"
import {Fiber} from "../../core/fiber.js"

export class Netfibers {
	sub = {
		primary: new Fiber(),
		userland: new Fiber(),
		meta: new Fiber<JsonRpc.Bidirectional>(),
	}

	megafiber = Fiber.multiplex(this.sub)
}

