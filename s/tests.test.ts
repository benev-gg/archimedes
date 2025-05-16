
import {Science} from "@e280/science"
import eureka from "./eureka/testing/eureka.test.js"
import parcels from "./core/parts/parcels/parcels.test.js"

await Science.run({
	eureka,
	archimedes: {
		parcels,
	},
})

