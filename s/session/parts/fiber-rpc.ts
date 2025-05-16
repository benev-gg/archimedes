
import {Fiber} from "../../core/parts/fiber.js"
import {Bidirectional, Endpoint, Fns, JsonRpc, Messenger, Remote, remote} from "renraku"

export class FiberRpc<RemoteFns extends Fns> {
	remote: Remote<RemoteFns>
	dispose: () => void

	#bidirectional: Bidirectional<undefined>

	constructor(public fiber: Fiber<JsonRpc.Bidirectional>, localEndpoint: Endpoint) {
		const messenger = new Messenger<RemoteFns>({
			timeout: 60_000,
			getLocalEndpoint: () => localEndpoint,
		})

		// this.#bidirectional = new Bidirectional({
		// 	timeout: 60_000,
		// 	sendRequest: m => fiber.reliable.send(m),
		// 	sendResponse: m => fiber.reliable.send(m),
		// })
		// this.dispose = fiber.reliable.recv.on(incoming => this.#bidirectional.receive(localEndpoint, incoming))
		// this.remote = remote(this.#bidirectional.remoteEndpoint)
	}
}

