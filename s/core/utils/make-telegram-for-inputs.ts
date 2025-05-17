
import {Schema, Telegram} from "../types.js"

export function makeTelegramForInputs<xSchema extends Schema>(
		futureTick: number,
		authorId: number,
		inputs: xSchema["input"][],
	): Telegram<xSchema> {

	return [futureTick, [["input", [authorId, inputs]]]]
}

