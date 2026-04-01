
import {asFns, asMessengerRpc} from "@e280/renraku"

export const makeMetaClientApi = () => asMessengerRpc(async _meta => asFns({}))

