
import {Fiber} from "../../core/parts/fiber.js"
import {Bidirectional, Conduit, Endpoint, Fns, JsonRpc, Messenger, Remote, remote} from "renraku"

export class FiberRpc<RemoteFns extends Fns> {
	remote: Remote<RemoteFns>
	dispose: () => void

	// #bidirectional: Bidirectional<undefined>

	constructor(public fiber: Fiber<JsonRpc.Bidirectional>, localEndpoint: Endpoint) {

		// TODO make a fiber conduit
		const conduit = new Conduit()

		const messenger = new Messenger<RemoteFns>({
			conduit,
			timeout: 60_000,
			getLocalEndpoint: () => localEndpoint,
		})

		this.remote = messenger.remote
		this.dispose = () => {}

		// this.#bidirectional = new Bidirectional({
		// 	timeout: 60_000,
		// 	sendRequest: m => fiber.reliable.send(m),
		// 	sendResponse: m => fiber.reliable.send(m),
		// })
		// this.dispose = fiber.reliable.recv.on(incoming => this.#bidirectional.receive(localEndpoint, incoming))
		// this.remote = remote(this.#bidirectional.remoteEndpoint)
	}
}

