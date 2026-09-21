
import {Component} from "../types.js"

export class BlockSlot {
	constructor(
		public component: Component<any>,
		public bytes: Uint8Array,
		private free: () => void,
	) {}

	read() {
		return this.component.read(this.bytes)
	}

	write(value: any) {
		this.component.write(this.bytes, value)
	}

	dispose() {
		this.component.delete(this.bytes)
		this.free()
	}
}

