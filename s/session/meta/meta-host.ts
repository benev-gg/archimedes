
import {asFns, asMessengerRpc} from "@e280/renraku"
import {Liaison} from "../../core/liaison.js"
import {Authority} from "../../core/authority.js"

export const makeMetaHostApi = (options: {
		authority: Authority<any>,
		liaison: Liaison<any>
	}) => asMessengerRpc(async _meta => asFns({

	async hello() {
		return {
			hostAuthorId: options.authority.authorId,
			clientAuthorId: options.liaison.authorId,
		}
	},
}))

