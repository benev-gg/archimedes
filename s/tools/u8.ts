
export function u8(bytes: Uint8Array) {
	return (bytes.buffer instanceof ArrayBuffer)
		? bytes as Uint8Array<ArrayBuffer>
		: new Uint8Array(bytes)
}

