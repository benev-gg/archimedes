
import {suite, test, expect} from "@e280/science"

export default suite({
	"sim": test(async() => {
		expect(1 + 1).is(2)
	}),
})

