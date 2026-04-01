
export type Fn<P extends any[]> = (...p: P) => void

export function pub<P extends any[]>(fn?: Fn<P>) {
	const fns = new Set<Fn<P>>()

	if (fn)
		fns.add(fn)

	function publish(...p: P) {
		for (const fn of fns)
			fn(...p)
	}

	publish.on = (fn: Fn<P>) => {
		fns.add(fn)
		return () => { fns.delete(fn) }
	}

	return publish
}

