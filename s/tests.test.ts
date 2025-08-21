
import {Science} from "@e280/science"
import eureka from "./eureka/testing/eureka.test.js"
import parcels from "./core/parts/parcels/parcels.test.js"
import integration from "./eureka/testing/integration.test.js"

await Science.run({
	eureka,
	integration,
	archimedes: {parcels},
})

