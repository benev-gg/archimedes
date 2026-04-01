
import {Netfibers} from "./netfibers.js"

export class Spoke {
	constructor(
		public fibers: Netfibers,
		public disconnect: () => void,
	) {}
}

