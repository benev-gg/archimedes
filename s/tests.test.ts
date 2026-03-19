
import {Science} from "@e280/science"
import eureka from "./eureka/testing/eureka.test.js"
import parcels from "./core/parcels/parcels.test.js"
import contact from "./core/contact/contact.test.js"
import integration from "./eureka/testing/integration.test.js"

import nova from "./alpha/ecs/test.js"

await Science.run({
	nova,
	eureka,
	integration,
	archimedes: {parcels, contact},
})

