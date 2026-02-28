interface Line {
    number: number;
    startIndex: number;
    content: string;
}
type StringStreamCondition = (stream: StringStream & {
    item: string;
}) => boolean;
interface SyntaxPointerErrorOptions {
    child?: Error;
    line?: number;
    column?: number;
    pointerLength?: number;
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
export declare class SyntaxPointerError extends Error {
    private originalMessage;
    stream: StringStream;
    child?: Error;
    line: number;
    column: number;
    pointerLength: number;
    constructor(message: string, stream: StringStream, { child, line, column, pointerLength, }?: SyntaxPointerErrorOptions);
    getOriginErrorMessage(): string;
    updatePointerMessage(): void;
}
/**
 * A simple string stream class.
 * Useful for language parsing
 */
export declare class StringStream {
    item?: string;
    index: number;
    string: string;
    line: number;
    column: number;
    lines: Line[];
    /**
     * @param str An array of characters
     */
    constructor(str: string);
    /**
     * @returns The length of the stream
     */
    get length(): number;
    /**
     * Returns the progress of the stream
     * @returns A number from 0 to 1
     */
    get progress(): number;
    /**
     * Getter for the next character in the stream
     */
    get next(): string | undefined;
    get currentLine(): Line;
    /**
     * Returns a slice of the stream relative to the current character
     *
     * Non-consuming
     * @param start Where to start the slice relative to the current character
     * @param end How many characters after the start to collect. Defaults to 1
     */
    peek(start: number, end?: number): string;
    /**
     * Consumes the current character in the stream
     */
    consume(): this is {
        item: string;
        next: string | undefined;
    };
    /**
     * Consumes {@link count} characters in the stream
     */
    consumeCount(count: number): void;
    /**
     * Consumes the stream while a condition is true
     */
    consumeWhile(condition: (stream: this & {
        item: string;
    }) => boolean): void;
    /**
     * Collects {@link count} characters in the stream and returns them.
     */
    collect(count?: number): string;
    /**
     * Consumes the stream while a condition is true and returns the consumed characters
     * @returns The consumed characters
     */
    collectWhile(condition: StringStreamCondition): string;
    /**
     * Returns the index of the first character to match the condition

     * Does not consume
     * @returns The index of the character or undefined if no character is found.
     */
    seek(comparison: string | ((c?: string) => boolean), maxDistance?: number): number | undefined;
    /**
     * Returns the stream index of the line specified
     */
    lineNumberToIndex(lineNumber: number): number;
}
export {};
