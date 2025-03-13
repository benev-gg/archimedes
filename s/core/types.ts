
import {Simulator} from "./simulator.js"

export type AuthorId = number
export type Authored<Content> = [AuthorId, Content]

export type Schema = {
	state: any
	delta: any
	input: any
}

export type StateDispatch<xSchema extends Schema> = ["state", xSchema["state"]]
export type DeltaDispatch<xSchema extends Schema> = ["delta", xSchema["delta"]]
export type InputDispatch<xSchema extends Schema> = ["input", xSchema["input"]]

export type Dispatch<xSchema extends Schema> = (
	| StateDispatch<xSchema>
	| DeltaDispatch<xSchema>
	| InputDispatch<xSchema>
)

export type Telegram<xSchema extends Schema> = Authored<Dispatch<xSchema>[]>
export type InputTelegram<xSchema extends Schema> = Authored<InputDispatch<xSchema["input"]>[]>

export type InferSimulatorSchema<S extends Simulator<any>> = (
	S extends Simulator<infer xSchema>
		? xSchema
		: never
)

