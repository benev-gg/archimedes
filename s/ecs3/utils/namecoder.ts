
import {need} from "@e280/stz"

export class Namecoder {
	#names = new Map<number, string>()
	#codes = new Map<string, number>()

	constructor(names: string[]) {
		for (const [code, name] of names.entries()) {
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

