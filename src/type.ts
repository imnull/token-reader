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

export type TTokenLite<T> = {
    type: T
    start: number
    end: number
    value: string
    depth: number
    nest: 0 | 1 | 2
    parent: TTokenLite<T> | null
}

export type TTokenReader<T> = {
    (content: string, start: number, parent: TToken<T> | null, previous: TToken<T> | null, initRelation?: boolean): TToken<T> | null
}

export type TTokenLiteReader<T> = {
    (content: string, start: number, parent: TTokenLite<T> | null, previous: TTokenLite<T> | null, initRelation?: boolean): TTokenLite<T> | null
}

export type TReader<T> = {
    (content: string, start?: number, parent?: TToken<T>, previous?: TToken<T>): TToken<T> | null
}

export type TCallbackReader<T> = {
    (content: string, callback: { (node: TTokenLite<T>): void }, start?: number): void
}

export type TTokenCallback<T> = { (s: string, i: number, p: TToken<T>, t: TToken<T>): string | [string, string] | null }
export type TTokenLiteCallback<T> = { (s: string, i: number, p: TTokenLite<T>, t: TTokenLite<T>): string | [string, string] | null }