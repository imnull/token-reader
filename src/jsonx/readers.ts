import { readQuote } from '../utils'
import { tokenReader, createReader } from '../reader'
import { TJsonTokenType } from './type'

const readers = [
    tokenReader<TJsonTokenType>('null', 'null', 0),
    tokenReader<TJsonTokenType>('undefined', 'undefined', 0),
    tokenReader<TJsonTokenType>('comma', ',', 0),
    tokenReader<TJsonTokenType>('colon', ':', 0),
    tokenReader<TJsonTokenType>('parentheses', '(', 1),
    tokenReader<TJsonTokenType>('parentheses-end', ')', 2),
    tokenReader<TJsonTokenType>('bracket', '[', 1),
    tokenReader<TJsonTokenType>('bracket-end', ']', 2),
    tokenReader<TJsonTokenType>('braces', '{', 1),
    tokenReader<TJsonTokenType>('braces-end', '}', 2),
    tokenReader<TJsonTokenType>('blank', /^\s+/, 0),
    tokenReader<TJsonTokenType>('plain', /^[\$_a-zA-Z]+[a-zA-Z$\d_]*/, 0),
    tokenReader<TJsonTokenType>('number', /^([\+\-]\s*)?([\d\.]+[eE][\+\-]?\d+|0?\.\d+|[1-9]\d*(\.(\d+)?)?)|0/, 0),
    tokenReader<TJsonTokenType>('quote', (s, i) => {
        const ch = s.charAt(i)
        if(['"', "'"].indexOf(ch) > -1) {
            return readQuote(s, i)
        }
        return null
    }, 0),
]

export const read = createReader<TJsonTokenType>(readers)