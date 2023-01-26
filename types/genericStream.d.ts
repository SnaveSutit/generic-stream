/**
 * A simple array stream class.
 * Useful for language parsing
 */
export declare class GenericStream<ItemType> {
    item?: ItemType;
    index: number;
    array: ItemType[];
    /**
     * @param array An array of items
     */
    constructor(array: ItemType[]);
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
     * Getter for the next item in the stream
     */
    get next(): ItemType | undefined;
    /**
     * Returns a slice of the stream relative to the current item
     *
     * Non-consuming
     * @param start Where to start the slice relative to the current item
     * @param end How many characters after the start to collect. Defaults to 1
     */
    look(start: number, end?: number): ItemType[];
    /**
     * Consumes the next item in the stream
     */
    consume(): void;
    /**
     * Consumes the stream while a condition is true
     */
    consumeWhile(condition: (stream: this) => boolean): void;
    /**
     * Consumes the next item in the stream and returns it
     * @returns The consumed item
     */
    collect(): ItemType | undefined;
    /**
     * Consumes the stream while a condition is true and returns the consumed items
     * @returns The consumed items
     */
    collectWhile(condition: (stream: this) => boolean): ItemType[];
    /**
     * Returns the index of the first item to match the condition

     * Does not consume
     * @returns The index of the item or undefined if no item is found.
     */
    seek(comparison: ItemType | ((c?: string) => boolean), maxDistance?: number): number | undefined;
}
