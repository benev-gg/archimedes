
import {run} from "@e280/science"
import ecs from "./ecs/test.js"
import net from "./net/test.js"
import sim from "./sim/test.js"

await run({ecs, net, sim})

