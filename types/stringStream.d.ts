/**
 * A simple string stream class.
 * Useful for language parsing
 */
export declare class StringStream {
    item?: string;
    index: number;
    string: string;
    itemCode?: number;
    line: number;
    column: number;
    lineStart: number;
    lines: {
        number: number;
        startIndex: number;
        content: string;
    }[];
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
    /**
     * Getter for the next character's charCode in the stream
     */
    get nextCode(): number | undefined;
    /**
     * Returns a slice of the stream relative to the current character
     *
     * Non-consuming
     * @param start Where to start the slice relative to the current character
     * @param end How many characters after the start to collect. Defaults to 1
     */
    look(start: number, end?: number): string;
    /**
     * Consumes the next character in the stream
     */
    consume(): void;
    /**
     * Consumes the stream while a condition is true
     */
    consumeWhile(condition: (stream: this) => boolean): void;
    /**
     * Consumes the next character in the stream and returns it
     * @returns The consumed character
     */
    collect(): string | undefined;
    /**
     * Consumes the stream while a condition is true and returns the consumed characters
     * @returns The consumed characters
     */
    collectWhile(condition: (stream: this) => boolean): string;
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
    private addLine;
}
