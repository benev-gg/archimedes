
import type {Component, FixedComponent, VariableComponent} from "../types.js"

export function isFixedComponent<Value>(component: Component<Value>): component is FixedComponent<Value> {
	return "size" in component
}

export function isVariableComponent<Value>(component: Component<Value>): component is VariableComponent<Value> {
	return !("size" in component)
}

