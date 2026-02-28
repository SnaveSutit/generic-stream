interface Line {
	number: number
	startIndex: number
	content: string
}

type StringStreamCondition = (stream: StringStream & { item: string }) => boolean

interface SyntaxPointerErrorOptions {
	child?: Error
	line?: number
	column?: number
	pointerLength?: number
}
/**
 * An error that points to a specific location in a StringStream
 *
 * Example:
 *```md
 * > Unexpected '}' at 1:5
 * > Hello, World!"}
 * >               ↑
 *```
 */
export class SyntaxPointerError extends Error {
	private originalMessage: string

	stream: StringStream
	child?: Error
	line: number
	column: number
	pointerLength: number

	constructor(
		message: string,
		stream: StringStream,
		{
			child,
			line = stream.line,
			column = stream.column,
			pointerLength = 1,
		}: SyntaxPointerErrorOptions = {}
	) {
		super(message)
		this.name = 'SyntaxPointerError'
		this.stream = stream
		this.child = child
		this.line = line
		this.column = column
		this.pointerLength = pointerLength

		this.originalMessage = message

		if (this.child) {
			this.message = `${this.message} at ${this.line}:${this.column}\n${this.child.message}`
			return
		}

		this.updatePointerMessage()
	}

	getOriginErrorMessage(): string {
		if (this.child) {
			if (this.child instanceof SyntaxPointerError) {
				return this.child.getOriginErrorMessage()
			}
			return this.child.message
		}
		return this.message
	}

	updatePointerMessage() {
		const startOfLine = this.stream.lines[this.line - 1].startIndex
		const endOfLine = this.stream.seek('\n')

		const lineString = this.stream.string.slice(startOfLine, endOfLine).trimEnd()

		// Get column where tabs count as 4 characters
		const actualColumn = lineString.slice(0, this.column - 1).replace(/\t/g, '    ').length + 1

		const pointer = ' '.repeat(actualColumn - 1) + '↑'.repeat(this.pointerLength)
		this.message = `${this.originalMessage} at ${this.line}:${this.column}\n${lineString}\n${pointer}`
	}
}

/**
 * A simple string stream class.
 * Useful for language parsing
 */
export class StringStream {
	item?: string
	index = 0
	string: string
	line = 1
	column = 1
	lines: Line[] = []

	/**
	 * @param str An array of characters
	 */
	constructor(str: string) {
		this.string = str.replace('\r', '')

		const lines = this.string.split('\n')
		let startIndex = 0
		for (let i = 0; i < lines.length; i++) {
			const content = lines[i]
			this.lines.push({ number: i + 1, startIndex, content })
			startIndex += content.length + 1
		}
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

	get currentLine(): Line {
		return this.lines[this.line - 1]
	}

	/**
	 * Returns a slice of the stream relative to the current character
	 *
	 * Non-consuming
	 * @param start Where to start the slice relative to the current character
	 * @param end How many characters after the start to collect. Defaults to 1
	 */
	peek(start: number, end = 1): string {
		return this.string.slice(this.index + start, this.index + start + end)
	}

	/**
	 * Consumes the current character in the stream
	 */
	consume(): this is { item: string; next: string | undefined } {
		if (this.item === '\n') {
			this.line++
			this.column = 0
		}
		this.item = this.string.at(this.index + 1)
		this.index++
		this.column++
		return true
	}

	/**
	 * Consumes {@link count} characters in the stream
	 */
	consumeCount(count: number): void {
		for (let i = 0; i < count; i++) this.consume()
	}

	/**
	 * Consumes the stream while a condition is true
	 */
	consumeWhile(condition: (stream: this & { item: string }) => boolean): void {
		while (this.item && condition(this as any)) this.consume()
	}

	/**
	 * Collects {@link count} characters in the stream and returns them.
	 */
	collect(count = 1): string {
		let items = ''
		let i = 0
		while (this.item && i < count) {
			items += this.item
			this.consume()
			i++
		}
		return items
	}

	/**
	 * Consumes the stream while a condition is true and returns the consumed characters
	 * @returns The consumed characters
	 */
	collectWhile(condition: StringStreamCondition): string {
		let items = ''
		while (this.item && condition(this as any)) {
			items += this.item
			this.consume()
		}
		return items
	}

	/**
	 * Returns the index of the first character to match the condition

	 * Does not consume
	 * @returns The index of the character or undefined if no character is found.
	 */
	seek(
		comparison: string | ((c?: string) => boolean),
		maxDistance = Infinity
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
		return this.lines[lineNumber - 1]?.startIndex ?? -1
	}
}
