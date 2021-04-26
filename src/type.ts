export type TToken<T> = {
    type: T
    originType: T
    start: number
    end: number
    value: string
    depth: number
    nest: 0 | 1 | 2
    weight: number
    parent: TToken<T> | null
    readerGroup: number
    readerId: number
}

export type TPlugin<T> = { (options: { assets: TAgentAssets<T>, parent: TToken<T>, previous: TToken<T> }): TAgentAssets<T> }

export type TAgent<T> = {
    (content: string, start: number, parent: TToken<T>, previous: TToken<T>, readerId: number, readerGroup: number): TToken<T>
}


export type TReaderCallback<T> = { (node: TToken<T>, ...args: any[]): boolean }

export type TReaderCallbackFactory<S, T> = { (stack: S, ...args: any[]): TReaderCallback<T> }

export type TReader<T> = {
    (content: string, callback: TReaderCallback<T>, start: number): number
}

export type TAgentAssets<T>= string | [string, string, T?, (0 | 1 | 2)?] | null

export type TAgentFunction<T> = { (s: string, i: number, parent: TToken<T>, previous: TToken<T>): TAgentAssets<T> }

export type TParser = { (content: string, start?: number) }