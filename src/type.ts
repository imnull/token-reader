export type TToken<T> = {
    type: T
    originType: T
    start: number
    end: number
    value: string
    depth: number
    nest: 0 | 1 | 2
    parent: TToken<T> | null
}

export type TAgent<T> = {
    (content: string, start: number, parent: TToken<T>, previous: TToken<T>): TToken<T>
}

/**
 * Provide a reader for parser to analyze the string content
 */
export type TReader<T> = {
    (content: string, callback: { (node: TToken<T>): void }, start?: number): void
}

export type TAgentAssets<T>= string | [string, string, T?] | null

export type TAgentFunction<T> = { (s: string, i: number, parent: TToken<T>, previous: TToken<T>): TAgentAssets<T> }