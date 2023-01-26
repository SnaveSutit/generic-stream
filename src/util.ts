/**
 * Compresses a number array to single values or min/max ranges
 * @returns A compressed version of the original array
 */
export function packArray(array: number[]) {
	const result: number[][] = []
	let current: number[] = [array[0]]
	for (let i = 1; i < array.length; i++) {
		if (array[i] - array[i - 1] === 1) current.push(array[i])
		else {
			result.push(current)
			current = [array[i]]
		}
	}
	result.push(current)

	// Map the values to single values, or min/max pairs
	return result.map((r) => (r.length === 1 ? r[0] : [r[0], r[r.length - 1]]))
}

/**
 * Generates a function that checks if a character is in a list of characters using only binary operations
 * @param str The characters this function will check for
 */
export function genComparison(str: string) {
	// Remove duplicate characters
	const obj: { [key: string]: number } = {}
	for (const c of str) obj[c] = c.charCodeAt(0)
	// Sort the characters by their char code to allow optimized ranged comparisons
	const chars = Object.keys(obj)
		.map((c) => c.charCodeAt(0))
		// JS doesn't seem to want to sort the array with it's internal function for some reason...
		.sort((a, b) => a - b)

	const ranges = packArray(chars)

	const operations = `${ranges
		.map((r) =>
			typeof r === 'number' ? `c===${r}` : `(c>=${r[0]}&&c<=${r[1]})`
		)
		.join('||')}`

	return new Function('c', `return ${operations}`) as (c?: number) => boolean
}
