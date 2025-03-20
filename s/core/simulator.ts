
import {AuthorId, Schema, Telegram} from "./types.js"
import {handleTelegram, handleTelegrams} from "./utils/handle-telegrams.js"

export abstract class Simulator<xSchema extends Schema> {
	static handleTelegram = handleTelegram
	static handleTelegrams = handleTelegrams

	constructor(public state: xSchema["state"]) {}

	abstract simulate(telegram: Telegram<xSchema>): xSchema["delta"]
	abstract tailor(authorId: AuthorId, telegram: Telegram<xSchema>): Telegram<xSchema>
}

