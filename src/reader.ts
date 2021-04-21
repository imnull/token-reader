import { TToken, TTokenReader, TReader, TTokenBase, TTokenCallback, TCallbackReader, TTokenLite, TTokenLiteReader, TTokenLiteCallback, TRecurrentCallbackReader } from './type'

export const stringReader = <T>(
    type: T,
    exp: string,
    nest: 0 | 1 | 2
): TTokenLiteReader<T> => {
    return (s: string, i: number, previous: TTokenLite<T>, parent: TTokenLite<T>, initRelation: boolean = true): TTokenLite<T> => {
        const seg = s.substring(i, i + exp.length)
        if (seg === exp) {
            const token: TTokenLite<T> = {
                start: i,
                end: i + seg.length,
                value: seg,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
            }
            return token
        }
    }
}

export const regReader = <T>(
    type: T,
    exp: RegExp,
    nest: 0 | 1 | 2
): TTokenLiteReader<T> => {
    return (s: string, i: number, previous: TTokenLite<T>, parent: TTokenLite<T>, initRelation: boolean = true): TTokenLite<T> => {
        const m = s.substring(i).match(exp)
        if (m) {
            const seg = m[0]
            const token: TTokenLite<T> = {
                start: i,
                end: i + seg.length,
                value: seg,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
            }
            return token
        }
    }
}

export const callReader = <T>(
    type: T,
    exp: TTokenLiteCallback<T>,
    nest: 0 | 1 | 2
): TTokenLiteReader<T> => {
    return (s: string, i: number, previous: TTokenLite<T>, parent: TTokenLite<T>, initRelation: boolean = true): TTokenLite<T> => {
        const seg = exp(s, i, parent, previous)
        if (seg) {
            const token: TTokenLite<T> = {
                start: i,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
                end: s.length,
                value: ''
            }
            if (Array.isArray(seg)) {
                const [raw, val = raw, t = type] = seg
                token.end = i + raw.length
                token.value = val
                token.type = t
            } else {
                token.end = i + seg.length
                token.value = seg
            }
            return token
        }
        return null
    }
}

export const tokenReader = <T>(
    type: T,
    expression: string | RegExp | TTokenLiteCallback<T>,
    nest: 0 | 1 | 2
): TTokenLiteReader<T> => {
    if (typeof expression === 'string') {
        return stringReader(type, expression, nest)
    } else if (typeof expression === 'function') {
        return callReader(type, expression, nest)
    } else if (expression instanceof RegExp) {
        return regReader(type, expression, nest)
    }
    return null
}

export const recurrentReader = <T>(readers: TTokenLiteReader<T>[], leftType: T): TRecurrentCallbackReader<T> => {
    const reader: TRecurrentCallbackReader<T> = (content, callback, start = 0, previous = null, parent = null) => {
        let token: TTokenLite<T> = null
        const m = content.substring(start).match(/^\s+/)
        if(m) {
            start += m[0].length
        }
        if (readers.some(r => {
            token = r(content, start, previous, parent)
            return !!token
        })) {
            callback(token)
            const { end } = token
            if (token.nest === 0) {
                previous = token
            } else if (token.nest === 1) {
                parent = token
                previous = null
            } else if (token.nest === 2) {
                previous = parent
                parent = previous ? previous.parent : null
            }
            reader(content, callback, end, previous, parent)
        }
    }
    return reader
}

export const charReader = <T>(readers: TTokenLiteReader<T>[], leftType: T): TCallbackReader<T> => {

    let previous: TTokenLite<T> = null
    let parent: TTokenLite<T> = null

    const read: TCallbackReader<T> = (content, callback, start = 0) => {
        const len = content.length
        let leftStart = start
        for (let i = start; i < len; i++) {
            let token: TTokenLite<T> = null
            if (readers.some(r => {
                token = r(content, i, previous, parent, false)
                return !!token
            })) {
                if (token.start - leftStart > 0) {
                    const leftToken: TTokenLite<T> = {
                        type: leftType,
                        originType: leftType,
                        start: leftStart,
                        end: token.start,
                        parent,
                        value: content.substring(leftStart, token.start),
                        depth: parent ? parent.depth + 1 : 0,
                        nest: 0,
                    }
                    callback(leftToken)
                    previous = leftToken
                }
                callback(token)
                if (token.nest === 0) {
                    previous = token
                } else if (token.nest === 1) {
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
        if (leftStart < content.length) {
            const leftToken: TTokenLite<T> = {
                type: leftType,
                originType: leftType,
                start: leftStart,
                end: content.length,
                parent,
                value: content.substring(leftStart),
                depth: parent ? parent.depth + 1 : 0,
                nest: 0,
            }
            callback(leftToken)
        }
    }
    return read
}