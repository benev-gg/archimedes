
import {asSchema} from "./schema/types.js"
import {hvec3, u32, u8, vec2, vec3, vec4} from "./schema/schemes.js"

export const schema = asSchema({
	health: u8,
	position: hvec3,
	velocity: vec3,
	rotation: vec4,
	gimbal: vec2,
	parent: u32,
})

