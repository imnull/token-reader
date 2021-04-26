import { readQuote } from '../utils'
import { agent, multiRecurrentReader } from '../reader'
import { TXcriptTokenType as X } from './type'

import { readers as jsonxReaders, TJsonTokenType as J } from '../jsonx/index'


export const readers = [
    // agent<X>('comma', ',', 0, 30),
    // agent<X>('colon', ':', 0, 30),
    // agent<X>('semicolon', ';', 0, 30, [({ assets, parent }) => {
    //     if(parent && parent.type === 'declare') {
    //         return [';', ';', 'declare-end', 2]
    //     }
    //     return assets
    // }]),
    // agent<X>('bracket-round', '(', 1, 30),
    // agent<X>('bracket-round-end', ')', 2, 30),
    // agent<X>('bracket-square', '[', 1, 30),
    // agent<X>('bracket-square-end', ']', 2, 30),
    // agent<X>('bracket-wind', '{', 1, 30),
    // agent<X>('bracket-wind-end', '}', 2, 30),
    
    // agent<X>('null', 'null', 0, 20),
    // agent<X>('undefined', 'undefined', 0, 20),

    // agent<X>('assign', '=', 0, 30),

    agent<X>('logical', ['&&', '||'], 0, 30),

    agent<X>('binary', [
        '+', '-', '*', '/', '%', '^', '|', '&', '>>>', '>>', '<<', '>=', '>', '<=', '<', '===', '==', '!==', '!='
    ], 0, 20, ({ assets, previous }) => {
        if(!previous || previous.type === 'binary' || previous.type === 'unary') {
            return null
        }
        return assets
    }),
    
    agent<X>('unary', ['+', '-', '~', '!', 'typeof', 'void'], 0, 10),

    

    // agent<X>('declare', 'var', 1, 10),
    // agent<X>('declare-end', (s, i, parent) => {
    //     if(parent && parent.type === 'declare') {
    //         if(s.length === i) {
    //             return ['', '', 'declare-end']
    //         }
    //     }
    //     return null
    // }, 2, 10),
    // agent<X>('line', (s, i, parent) => {
    //     const m = s.substring(i).match(/^[\r\n]+/)
    //     if(!m) {
    //         return null
    //     }
    //     return m[0]
    // }, 2, 10),
    // agent<X>('return', 'return', 0, 10),
    // agent<X>('if', 'if', 0, 10),
    // agent<X>('else', 'else', 0, 10),
    // agent<X>('while', 'while', 0, 10),
    // agent<X>('switch', 'switch', 0, 10),
    // agent<X>('case', 'case', 0, 10),
    // agent<X>('break', 'break', 0, 10),

    // agent<X>('id', REG_ID, 0),
    // agent<X>('number', REG_NUMBER, 0),
    // agent<X>('string', readString, 0),
]

// export const read = recurrentReader<T>(readers)
export const read = multiRecurrentReader<X | J>(readers, jsonxReaders)