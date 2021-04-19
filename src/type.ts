export type TTokenBase = {
    start: number
    end: number
    value: string
    depth: number
    first: TTokenBase | null
    parent: TTokenBase | null
    previous: TTokenBase | null
    next: TTokenBase | null
    nest: 0 | 1 | 2
}

export type TToken<T> = TTokenBase & {
    type: T
    first: TToken<T> | null
    parent: TToken<T> | null
    previous: TToken<T> | null
    next: TToken<T> | null
}

export type TTokenReader<T> = {
    (content: string, start: number, parent: TToken<T>, previous: TToken<T>): TToken<T> | null
}

export type TReader<T> = {
    (content: string, start?: number, parent?: TToken<T>, previous?: TToken<T>): TToken<T> | null
}

export type TTraverseCallback<T> = { (node: TToken<T>): void }