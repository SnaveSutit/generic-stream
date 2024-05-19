interface ILine {
	number: number
	startIndex: number
	content: string
}

/**
 * A simple string stream class.
 * Useful for language parsing
 */
export class StringStream {
	item?: string
	index: number = -1
	string: string
	itemCode?: number
	line: number = 1
	column: number = 0
	lineStart: number = 0
	lines: ILine[] = [{ number: 1, startIndex: 0, content: '' }]

	/**
	 * @param str An array of characters
	 */
	constructor(str: string) {
		this.string = str
		this.consume()
	}

	/**
	 * @returns The length of the stream
	 */
	get length(): number {
		return this.string.length
	}

	/**
	 * Returns the progress of the stream
	 * @returns A number from 0 to 1
	 */
	get progress(): number {
		return Math.min(this.index / this.length, 1)
	}

	/**
	 * Getter for the next character in the stream
	 */
	get next(): string | undefined {
		return this.string.at(this.index + 1)
	}

	/**
	 * Getter for the next character's charCode in the stream
	 */
	get nextCode(): number | undefined {
		return this.string.charCodeAt(this.index + 1)
	}

	get currentLine(): ILine {
		return this.lines[this.line - 1]
	}

	/**
	 * Returns a slice of the stream relative to the current character
	 *
	 * Non-consuming
	 * @param start Where to start the slice relative to the current character
	 * @param end How many characters after the start to collect. Defaults to 1
	 */
	look(start: number, end: number = 1): string {
		return this.string.slice(this.index + start, this.index + start + end)
	}

	/**
	 * Consumes the next character in the stream
	 */
	consume(): void {
		const last = this.item
		if (this.item) this.currentLine.content += this.item
		this.item = this.string.at(this.index + 1)
		this.itemCode = this.item?.charCodeAt(0)
		this.index++
		this.column++
		if (last === '\n' || (!(last == undefined) && this.item == undefined)) this.completeLine()
	}

	/**
	 * Consumes N characters in the stream
	 */
	consumeN(n: number): void {
		for (let i = 0; i < n; i++) this.consume()
	}

	/**
	 * Consumes the stream while a condition is true
	 */
	consumeWhile(condition: (stream: this) => boolean): void {
		while (this.item && condition(this)) this.consume()
	}

	/**
	 * Consumes the next character in the stream and returns it
	 * @returns The consumed character
	 */
	collect(): string | undefined {
		const last = this.item
		this.consume()
		return last
	}

	/**
	 * Collects N characters in the stream and returns them.
	 */
	collectN(n: number): string {
		let items = ''
		for (let i = 0; i < n; i++) items += this.collect()!
		return items
	}

	/**
	 * Consumes the stream while a condition is true and returns the consumed characters
	 * @returns The consumed characters
	 */
	collectWhile(condition: (stream: this) => boolean): string {
		let items = ''
		while (this.item && condition(this)) items += this.collect()!
		return items
	}

	/**
	 * Returns the index of the first character to match the condition

	 * Does not consume
	 * @returns The index of the character or undefined if no character is found.
	 */
	seek(
		comparison: string | ((c?: string) => boolean),
		maxDistance: number = Infinity
	): number | undefined {
		maxDistance = Math.min(this.index + maxDistance, this.length)
		if (typeof comparison === 'function') {
			for (let i = this.index; i < maxDistance; i++) {
				const c = this.string.at(i)
				if (comparison(c)) return i
			}
		} else {
			for (let i = this.index; i < maxDistance; i++) {
				const c = this.string.at(i)
				if (c === comparison) return i
			}
		}
	}

	/**
	 * Returns the stream index of the line specified
	 */
	lineNumberToIndex(lineNumber: number) {
		return lineNumber - 1
	}

	private completeLine(): void {
		this.line++
		this.column = 1
		this.lines.push({
			number: this.line,
			startIndex: this.index,
			content: '',
		})
	}
}
