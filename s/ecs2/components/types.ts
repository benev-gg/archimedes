
export type Components = {[key: string]: Component<any>}

export type Component<Value> = {
	size: number
	write: (bytes: Uint8Array, value: Value) => void
	read: (bytes: Uint8Array) => Value
	delete: (bytes: Uint8Array) => void
}

export const asComponent = <Value>(c: Component<Value>) => c
export const asComponents = <C extends Components>(c: C) => c

export type ComponentValue<C extends Component<any>> = (
	C extends Component<infer V>
		? V
		: never
)

export type ComponentValues<C extends Components> = {
	[K in keyof C]: ComponentValue<C[K]>
}

