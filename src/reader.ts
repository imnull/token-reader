import { TToken, TTokenReader, TReader } from './type'
import { getFirstNode } from './utils'

export const createStringReader = <T>(
    type: T,
    expression: string,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>): TToken<T> => {
        const seg = s.substring(i, i + expression.length)
        if(seg === expression) {
            const token = {
                start: i,
                end: i + seg.length,
                value: seg,
                parent,
                type,
                depth: parent ? parent.depth + 1 : 0,
                next: null,
                previous,
                nest,
                first: null,
            }
            if(previous && nest !== 2) {
                previous.next = token
            }
            if(parent && !parent.first) {
                parent.first = token
            }
            return token
        }
    }
}

export const createRegExpReader = <T>(
    type: T,
    expression: RegExp,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>): TToken<T> => {
        const m = s.substring(i).match(expression)
        if(m) {
            const seg = m[0]
            const token = {
                start: i,
                end: i + seg.length,
                value: seg,
                parent,
                type,
                depth: parent ? parent.depth + 1 : 0,
                next: null,
                previous,
                nest,
                first: null,
            }
            if(previous && nest !== 2) {
                previous.next = token
            }
            if(parent && !parent.first) {
                parent.first = token
            }
            return token
        }
    }
}

export const createCallbackReader = <T>(
    type: T,
    expression: { (s: string, i: number): string | null },
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>): TToken<T> => {
        const seg = expression(s, i)
        if(seg) {
            const token = {
                start: i,
                end: i + seg.length,
                value: seg,
                parent,
                type,
                depth: parent ? parent.depth + 1 : 0,
                next: null,
                previous,
                nest,
                first: null,
            }
            if(previous && nest !== 2) {
                previous.next = token
            }
            if(parent && !parent.first) {
                parent.first = token
            }
            return token
        }
    }
}

export const createTokenReader = <T>(
    type: T,
    expression: string | RegExp | { (s: string, i: number): string | null },
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    if(typeof expression === 'string') {
        return createStringReader(type, expression, nest)
    } else if(typeof expression === 'function') {
        return createCallbackReader(type, expression, nest)
    } else if(expression instanceof RegExp) {
        return createRegExpReader(type, expression, nest)
    }
    return null
}

export const createReader = <T>(readers: TTokenReader<T>[]): TReader<T> => {
    const reader = (content: string, start: number = 0, previous: TToken<T> = null, parent: TToken<T> = null) => {
        let token: TToken<T> = null
        if(readers.some(r => {
            token = r(content, start, previous, parent)
            return !!token
        })) {
            const { end } = token
            if(end > start) {
                if(token.nest === 0) {
                    previous = token
                } else if(token.nest === 1) {
                    parent = token
                    previous = null
                } else if(token.nest === 2) {
                    previous = parent
                    parent = previous ? previous.parent : null
                }
                return reader(content, end, previous, parent)
            }
        }
        let n = token || previous
        if(n) {
            n = getFirstNode<T>(n)
        }
        return n
    }
    return reader
}

export default createReader