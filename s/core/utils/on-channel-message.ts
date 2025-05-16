
export function onChannelMessage(
		channel: RTCDataChannel,
		onmessage: (message: any) => void,
	) {

	const listener = (event: MessageEvent) => onmessage(event.data)
	channel.addEventListener("message", listener)
	return () => channel.removeEventListener("message", listener)
}

