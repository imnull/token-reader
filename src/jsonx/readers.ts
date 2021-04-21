import { readQuote } from '../utils'
import { tokenReader, recurrentReader } from '../reader'
import { TJsonTokenType as T } from './type'
import { TTokenLite } from '../type'

const isInNest = (parent: TTokenLite<T>) => {
    return parent && parent.nest === 1 && ['braces', 'bracket'].indexOf(parent.type) > -1
}

const REG_NUMBER = /^([\+\-]\s*)?([\d\.]+[eE][\+\-]?\d+|0?\.\d+|[1-9]\d*(\.(\d+)?)?)|0/
const REG_ID = /^[\$_a-zA-Z]+[a-zA-Z$\d_]*/

const getReturn = (parent: TTokenLite<T>, previous: TTokenLite<T>, raw: string, val: string = raw) => {
    if(parent) {
        if(parent.type === 'bracket') {
            return [raw, val, 'array-value'] as [string, string, T]
        } else if(parent.type === 'braces') {
            const t: T = previous && previous.type === 'colon' ? 'property-value' : 'property-name'
            return [raw, val, t] as [string, string, T]
        }
    }
    return [raw, val] as [string, string, T?]
}

const readers = [
    tokenReader<T>('null', 'null', 0),
    tokenReader<T>('undefined', 'undefined', 0),
    tokenReader<T>('id', (s, i, parent, previous) => {
        const m = s.substring(i).match(REG_ID)
        if(!m) {
            return null
        }
        return getReturn(parent, previous, m[0])
    }, 0),
    tokenReader<T>('number', (s, i, parent, previous) => {
        const m = s.substring(i).match(REG_NUMBER)
        if(!m) {
            return null
        }
        return getReturn(parent, previous, m[0])
    }, 0),
    tokenReader<T>('string', (s, i, parent, previous) => {
        const ch = s.charAt(i)
        if(['"', "'"].indexOf(ch) > -1) {
            const str = readQuote(s, i)
            if(str) {
                return getReturn(parent, previous, str, str.slice(1, -1))
            }
        }
        return null
    }, 0),
    tokenReader<T>('comma', (s, i, parent) => {
        const char = s.charAt(i)
        if(char !== ',') {
            return null
        }
        if(parent && parent.type === 'bracket') {
            return [char, char, 'array-comma']
        }
        return char
    }, 0),
    tokenReader<T>('colon', ':', 0),
    tokenReader<T>('braces', '{', 1),
    tokenReader<T>('braces-end', '}', 2),
    tokenReader<T>('bracket', '[', 1),
    tokenReader<T>('bracket-end', ']', 2),
    tokenReader<T>('parentheses', '(', 1),
    tokenReader<T>('parentheses-end', ')', 2),
]

export const read = recurrentReader<T>(readers, 'blank')