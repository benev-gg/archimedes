
import {AuthorId, Schema, Telegram} from "../types.js"

export function handleTelegram<xSchema extends Schema>(
		telegram: Telegram<xSchema>,
		callbacks: DispatchCallbacks<xSchema>,
	) {

	const [authorId, dispatches] = telegram

	for (const [key, content] of dispatches) {
		switch (key) {

			case "state":
				callbacks.state(content, authorId)
				break

			case "delta":
				callbacks.delta(content, authorId)
				break

			case "input":
				callbacks.input(content, authorId)
				break
		}
	}
}

export type DispatchCallbacks<xSchema extends Schema> = {
	state: (state: xSchema["state"], authorId: AuthorId) => void
	delta: (delta: xSchema["delta"], authorId: AuthorId) => void
	input: (input: xSchema["input"], authorId: AuthorId) => void
}

