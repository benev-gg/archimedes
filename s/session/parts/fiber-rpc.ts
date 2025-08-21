
import {Fiber} from "../../core/parts/fiber.js"
import {Conduit, Fns, JsonRpc, Messenger, MessengerRpc, Remote} from "@e280/renraku"

export class FiberConduit extends Conduit {
	constructor(public fiber: Fiber<JsonRpc.Bidirectional>) {
		super()
		this.sendRequest.sub(m => fiber.reliable.send(m))
		this.sendResponse.sub(m => fiber.reliable.send(m))
		fiber.reliable.recv.on(m => this.recv.pub(m, {origin: ""}))
	}
}

export class FiberRpc<RemoteFns extends Fns> {
	remote: Remote<RemoteFns>
	dispose: () => void

	constructor(public fiber: Fiber<JsonRpc.Bidirectional>, rpc: MessengerRpc<any, RemoteFns>) {
		const messenger = new Messenger<any, RemoteFns>({
			rpc,
			conduit: new FiberConduit(fiber),
			timeout: 60_000,
		})
		this.remote = messenger.remote
		this.dispose = () => {}
	}
}

