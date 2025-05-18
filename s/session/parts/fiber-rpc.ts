
import {Fiber} from "../../core/parts/fiber.js"
import {Conduit, Endpoint, Fns, JsonRpc, Messenger, Remote} from "renraku"

export class FiberConduit extends Conduit {
	constructor(public fiber: Fiber<JsonRpc.Bidirectional>) {
		super()
		this.sendRequest.sub(m => fiber.reliable.send(m))
		this.sendResponse.sub(m => fiber.reliable.send(m))
		fiber.reliable.recv.on(m => this.recv.pub(m, {data: m, origin: ""}))
	}
}

export class FiberRpc<RemoteFns extends Fns> {
	remote: Remote<RemoteFns>
	dispose: () => void

	constructor(public fiber: Fiber<JsonRpc.Bidirectional>, localEndpoint: Endpoint) {
		const messenger = new Messenger<RemoteFns>({
			conduit: new FiberConduit(fiber),
			timeout: 60_000,
			getLocalEndpoint: () => localEndpoint,
		})
		this.remote = messenger.remote
		this.dispose = () => {}
	}
}

