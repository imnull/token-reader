export type TTokenLite<T> = {
    type: T
    originType: T
    start: number
    end: number
    value: string
    depth: number
    nest: 0 | 1 | 2
    parent: TTokenLite<T> | null
}

export type TTokenLiteReader<T> = {
    (content: string, start: number, parent: TTokenLite<T> | null, previous: TTokenLite<T> | null, initRelation?: boolean): TTokenLite<T> | null
}

export type TCallbackReader<T> = {
    (content: string, callback: { (node: TTokenLite<T>): void }, start?: number): void
}

export type TRecurrentCallbackReader<T> = {
    (content: string, callback: { (node: TTokenLite<T>): void }, start?: number, previous?: TTokenLite<T>, parent?: TTokenLite<T>): void
}

export type TTokenLiteCallback<T> = { (s: string, i: number, p: TTokenLite<T>, t: TTokenLite<T>): string | [string, string, T?] | null }