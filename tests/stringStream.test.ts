import { describe, expect, it } from 'vitest'
import { StringStream } from '../src'

describe('stringStream', () => {
	it('should parse lines correctly', () => {
		const stream = new StringStream('line 1\nline 2\nline 3')

		expect(stream.lines.length).toBe(3)
		expect(stream.lines[0]).toEqual({ number: 1, content: 'line 1', startIndex: 0 })
		expect(stream.lines[1]).toEqual({ number: 2, content: 'line 2', startIndex: 7 })
		expect(stream.lines[2]).toEqual({ number: 3, content: 'line 3', startIndex: 14 })
	})

	it('should track line and column correctly', () => {
		const stream = new StringStream('line 1\nline 2\nline 3')

		let result = ''
		while (stream.index < stream.length) {
			const char = stream.string[stream.index]
			result += `Char: "${char}" Line: ${stream.line} Column: ${stream.column}\n`
			stream.consume()
		}
		expect(result).toMatchSnapshot()
	})
})
