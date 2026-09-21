
import {need} from "@e280/stz"
import {Components} from "../components/types.js"

export class Namecoder {
	#names = new Map<number, string>()
	#codes = new Map<string, number>()

	constructor(components: Components) {
		for (const [code, name] of Object.keys(components).entries()) {
			this.#names.set(code, name)
			this.#codes.set(name, code)
		}
	}

	name(code: number) {
		return need(this.#names, code)
	}

	code(name: PropertyKey) {
		return need(this.#codes, name)
	}
}

