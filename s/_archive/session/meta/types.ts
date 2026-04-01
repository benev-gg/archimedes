
import {Fns} from "@e280/renraku"
import type {makeMetaHostApi} from "./meta-host.js"
import type {makeMetaClientApi} from "./meta-client.js"

export type CustomApi = {
	host: Fns
	client: Fns
}

export type MetaApi = {
	host: Awaited<ReturnType<ReturnType<typeof makeMetaHostApi>>>
	client: Awaited<ReturnType<ReturnType<typeof makeMetaClientApi>>>
}

