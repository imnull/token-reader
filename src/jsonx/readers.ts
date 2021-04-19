import { readQuote } from '../utils'
import { createTokenReader, createReader } from '../reader'
import { TJsonTokenType } from './type'

const readers = [
    createTokenReader<TJsonTokenType>('null', 'null', 0),
    createTokenReader<TJsonTokenType>('undefined', 'undefined', 0),
    createTokenReader<TJsonTokenType>('comma', ',', 0),
    createTokenReader<TJsonTokenType>('colon', ':', 0),
    createTokenReader<TJsonTokenType>('parentheses', '(', 1),
    createTokenReader<TJsonTokenType>('parentheses-end', ')', 2),
    createTokenReader<TJsonTokenType>('bracket', '[', 1),
    createTokenReader<TJsonTokenType>('bracket-end', ']', 2),
    createTokenReader<TJsonTokenType>('braces', '{', 1),
    createTokenReader<TJsonTokenType>('braces-end', '}', 2),
    createTokenReader<TJsonTokenType>('blank', /^\s+/, 0),
    createTokenReader<TJsonTokenType>('plain', /^[\$_a-zA-Z]+[a-zA-Z$\d_]*/, 0),
    createTokenReader<TJsonTokenType>('number', /^([\+\-]\s*)?([\d\.]+[eE][\+\-]?\d+|0?\.\d+|[1-9]\d*(\.(\d+)?)?)|0/, 0),
    createTokenReader<TJsonTokenType>('quote', (s, i) => {
        const ch = s.charAt(i)
        if(['"', "'"].indexOf(ch) > -1) {
            return readQuote(s, i)
        }
        return null
    }, 0),
]

export const read = createReader<TJsonTokenType>(readers)