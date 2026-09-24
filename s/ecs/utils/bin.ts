
import {bytes} from "@e280/stz"
import {endian} from "./consts.js"
import {dataView} from "./data-view.js"

export class BinWriter {
	#parts: Uint8Array[] = []

	bytes(data: Uint8Array) {
		this.#parts.push(data)
		return this
	}

	u8(value: number) {
		checkUint(value, 0xff)
		return this.bytes(Uint8Array.of(value))
	}

	u16(value: number) {
		checkUint(value, 0xffff)
		const data = new Uint8Array(2)
		dataView(data).setUint16(0, value, endian)
		return this.bytes(data)
	}

	u32(value: number) {
		checkUint(value, 0xffffffff)
		const data = new Uint8Array(4)
		dataView(data).setUint32(0, value, endian)
		return this.bytes(data)
	}

	done() {
		return bytes.concat(this.#parts)
	}
}

export class BinReader {
	#offset = 0

	constructor(private data: Uint8Array) {}

	get done() {
		return this.#offset === this.data.length
	}

	bytes(length: number) {
		const end = this.#offset + length

		if (end > this.data.length)
			throw new RangeError("unexpected end of binary data")

		const chunk = this.data.subarray(this.#offset, end)
		this.#offset = end

		return chunk
	}

	u8() {
		return this.bytes(1)[0]!
	}

	u16() {
		return dataView(this.bytes(2)).getUint16(0, endian)
	}

	u32() {
		return dataView(this.bytes(4)).getUint32(0, endian)
	}
}

function checkUint(value: number, max: number) {
	if (!Number.isInteger(value) || value < 0 || value > max)
		throw new RangeError(`invalid uint ${value}`)
}

