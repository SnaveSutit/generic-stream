/**
 * A simple array stream class.
 * Useful for language parsing
 */
export class GenericStream<ItemType> {
	// TODO Check the performance of making item a getter instead
	item?: ItemType
	index: number = -1
	array: ItemType[]

	/**
	 * @param array An array of items
	 */
	constructor(array: ItemType[]) {
		this.array = array
		this.consume()
	}

	/**
	 * @returns The length of the stream
	 */
	get length(): number {
		return this.array.length
	}

	/**
	 * Returns the progress of the stream
	 * @returns A number from 0 to 1
	 */
	get progress(): number {
		return Math.min(this.index / this.length, 1)
	}

	/**
	 * Getter for the next item in the stream
	 */
	get next(): ItemType | undefined {
		return this.array.at(this.index + 1)
	}

	/**
	 * Returns a slice of the stream relative to the current item
	 *
	 * Non-consuming
	 * @param start Where to start the slice relative to the current item
	 * @param end How many characters after the start to collect. Defaults to 1
	 */
	look(start: number, end: number = 1): ItemType[] {
		return this.array.slice(this.index + start, this.index + start + end)
	}

	/**
	 * Consumes the next item in the stream
	 */
	consume(): void {
		this.index++
		this.item = this.array.at(this.index)
	}

	/**
	 * Consumes the stream while a condition is true
	 */
	consumeWhile(condition: (stream: this) => boolean): void {
		while (this.item && condition(this)) this.consume()
	}

	/**
	 * Consumes the next item in the stream and returns it
	 * @returns The consumed item
	 */
	collect(): ItemType | undefined {
		const last = this.item
		this.index++
		this.item = this.array.at(this.index)
		return last
	}

	/**
	 * Consumes the stream while a condition is true and returns the consumed items
	 * @returns The consumed items
	 */
	collectWhile(condition: (stream: this) => boolean): ItemType[] {
		const items: ItemType[] = []
		while (this.item && condition(this)) items.push(this.collect()!)
		return items
	}

	/**
	 * Returns the index of the first item to match the condition

	 * Does not consume
	 * @returns The index of the item or undefined if no item is found.
	 */
	seek(
		comparison: ItemType | ((c?: string) => boolean),
		maxDistance: number = Infinity
	): number | undefined {
		maxDistance = Math.min(this.index + maxDistance, this.length)
		if (typeof comparison === 'function') {
			for (let i = this.index; i < maxDistance; i++) {
				const c = this.array.at(i)
				// @ts-ignore
				if (comparison(c)) return i
			}
		} else {
			for (let i = this.index; i < maxDistance; i++) {
				const c = this.array.at(i)
				if (c && c === comparison) return i
			}
		}
	}
}
