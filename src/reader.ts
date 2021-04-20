import { TToken, TTokenReader, TReader, TTokenBase, TTokenCallback } from './type'
import { getFirstNode } from './utils'

const initToken = (token: TTokenBase, previous: TTokenBase, parent: TTokenBase) => {

    token.parent = parent
    token.depth = parent ? parent.depth + 1 : 0

    if(previous) {
        previous.next = token
    }
    if(parent && !parent.first) {
        parent.first = token
    }
}

export const stringReader = <T>(
    type: T,
    exp: string,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>, initRelation: boolean = true): TToken<T> => {
        const seg = s.substring(i, i + exp.length)
        if(seg === exp) {
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
            initRelation && initToken(token, previous, parent)
            return token
        }
    }
}

export const regReader = <T>(
    type: T,
    exp: RegExp,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>, initRelation: boolean = true): TToken<T> => {
        const m = s.substring(i).match(exp)
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
            initRelation && initToken(token, previous, parent)
            return token
        }
    }
}

export const callReader = <T>(
    type: T,
    exp: TTokenCallback<T>,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    return (s: string, i: number, previous: TToken<T>, parent: TToken<T>, initRelation: boolean = true): TToken<T> => {
        const seg = exp(s, i, parent, previous)
        if(seg) {
            const token = {
                start: i,
                parent,
                type,
                depth: parent ? parent.depth + 1 : 0,
                next: null,
                previous,
                nest,
                first: null,
                end: s.length,
                value: ''
            }
            if(Array.isArray(seg)) {
                token.end = i + seg[0].length
                token.value = seg[1]
            } else {
                token.end = i + seg.length
                token.value = seg
            }
            
            initRelation && initToken(token, previous, parent)
            return token
        }
        return null
    }
}

export const tokenReader = <T>(
    type: T,
    expression: string | RegExp | TTokenCallback<T>,
    nest: 0 | 1 | 2
): TTokenReader<T> => {
    if(typeof expression === 'string') {
        return stringReader(type, expression, nest)
    } else if(typeof expression === 'function') {
        return callReader(type, expression, nest)
    } else if(expression instanceof RegExp) {
        return regReader(type, expression, nest)
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

export const charReader = <T>(readers: TTokenReader<T>[], rootType: T, leftType: T): TReader<T> => {
    const root: TToken<T> = {
        type: rootType,
        start: 0,
        end: 0,
        parent: null,
        value: 'root',
        first: null,
        next: null,
        depth: 0,
        previous: null,
        nest: 0,
    }
    let previous: TToken<T> = null
    let parent: TToken<T> = root

    const read = (content: string, start: number = 0) => {
        const len = content.length
        let leftStart = start
        for(let i = start; i < len; i++) {
            let token: TToken<T> = null
            if(readers.some(r => {
                token = r(content, i, previous, parent, false)
                return !!token
            })) {
                if(token.start - leftStart > 0) {
                    const leftToken: TToken<T> = {
                        type: leftType,
                        start: leftStart,
                        end: token.start,
                        parent,
                        value: content.substring(leftStart, token.start),
                        first: null,
                        next: null,
                        depth: parent ? parent.depth + 1 : 0,
                        previous: null,
                        nest: 0,
                    }
                    initToken(leftToken, previous, parent)
                    previous = leftToken
                }
                initToken(token, previous, parent)
                if(token.nest === 0) {
                    previous = token
                } else if(token.nest === 1) {
                    previous = null
                    parent = token
                } else {
                    previous = parent
                    parent = previous ? previous.parent : null
                }
                leftStart = token.end
                i = leftStart - 1
            }
        }
        if(leftStart < content.length) {
            const leftToken: TToken<T> = {
                type: leftType,
                start: leftStart,
                end: content.length,
                parent,
                value: content.substring(leftStart),
                first: null,
                next: null,
                depth: parent ? parent.depth + 1 : 0,
                previous: null,
                nest: 0,
            }
            initToken(leftToken, previous, parent)
        }
        return root
    }
    return read
}