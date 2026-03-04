import { describe, expect, it } from 'bun:test'
import { StringStream } from '../src'

const code = (char: string) => char.charCodeAt(0)

describe('StringStream', () => {
	it('initializes with expected defaults and exposes current characters', () => {
		const stream = new StringStream('ab\ncd')

		expect(stream.length).toBe(5)
		expect(stream.cursor).toBe(0)
		expect(stream.line).toBe(1)
		expect(stream.column).toBe(1)
		expect(stream.progress).toBe(0)
		expect(stream.getPosition()).toEqual({ line: 1, column: 1 })

		expect(stream.item).toBe(code('a'))
		expect(stream.next).toBe(code('b'))
		expect(stream.previous).toBeUndefined()
		expect(stream.at(2)).toBe(code('\n'))
	})

	it('builds line metadata and maps line numbers to indexes', () => {
		const stream = new StringStream('foo\nbar\n')

		expect(stream.lines).toHaveLength(3)
		expect(stream.currentLine).toEqual({
			number: 1,
			startIndex: 0,
			endIndex: 3,
			content: 'foo\n',
		})
		expect(stream.lines[1]).toEqual({
			number: 2,
			startIndex: 4,
			endIndex: 7,
			content: 'bar\n',
		})
		expect(stream.lines[2]).toEqual({
			number: 3,
			startIndex: 8,
			endIndex: 8,
			content: '\n',
		})

		expect(stream.lineNumberToIndex(1)).toBe(0)
		expect(stream.lineNumberToIndex(2)).toBe(4)
		expect(stream.lineNumberToIndex(3)).toBe(8)
		expect(stream.lineNumberToIndex(999)).toBe(-1)
	})

	it('advances through regular characters and newlines while updating line/column', () => {
		const stream = new StringStream('a\nb')

		stream.advance()
		expect(stream.cursor).toBe(1)
		expect(stream.line).toBe(1)
		expect(stream.column).toBe(2)
		expect(stream.item).toBe(code('\n'))

		stream.advance()
		expect(stream.cursor).toBe(2)
		expect(stream.line).toBe(2)
		expect(stream.column).toBe(1)
		expect(stream.item).toBe(code('b'))
	})

	it('throws when advancing past end of stream and clamps progress at 1', () => {
		const stream = new StringStream('a')

		stream.advance()
		expect(stream.progress).toBe(1)
		expect(() => stream.advance()).toThrow('Cannot advance past the end of the stream')
	})

	it('advanceUntil stops on target character without consuming it', () => {
		const stream = new StringStream('ab\ncd\nef')

		stream.advanceUntil(code('e'))

		expect(stream.cursor).toBe(6)
		expect(stream.line).toBe(3)
		expect(stream.column).toBe(1)
		expect(stream.item).toBe(code('e'))
	})

	it('peek and slice return text without advancing', () => {
		const stream = new StringStream('hello world')

		expect(stream.peek(5)).toBe('hello')
		expect(stream.slice(0, 5)).toBe('hello')
		expect(stream.cursor).toBe(0)
	})

	it('seek finds characters by value or predicate and respects maxDistance', () => {
		const stream = new StringStream('abcde')

		expect(stream.seek(code('c'))).toBe(2)
		expect(stream.seek(c => (c ?? 0) > code('c'))).toBe(3)
		expect(stream.seek(code('e'), 3)).toBeUndefined()
	})

	it('match checks from current cursor position', () => {
		const stream = new StringStream('abcdef')

		expect(stream.match('abc')).toBeTrue()
		expect(stream.match('abd')).toBeFalse()

		stream.advance()
		expect(stream.match('bcd')).toBeTrue()
		expect(stream.match('abc')).toBeFalse()
	})

	it('normalizes carriage returns in constructor input', () => {
		const stream = new StringStream('a\r\nb\r')

		expect(stream.slice(0, stream.length)).toBe('a\nb\r')
	})
})
