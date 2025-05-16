
import {Science, test, expect} from "@e280/science"
import {setupIntegrationSituation} from "./situations/integration.js"

export default Science.suite({

	"we host a game, we join it": test(async() => {
		const integration = setupIntegrationSituation()
		// TODO establish an archimedes loopback that is
	}),
})

