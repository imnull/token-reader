import { readMiniBinder, readQuote } from './utils'
import { TTokenLite } from './type'

export const REG_NUMBER = /^([\+\-]\s*)?([\d\.]+[eE][\+\-]?\d+|0?\.\d+|[1-9]\d*(\.(\d+)?)?|0)/
export const REG_ID = /^[\$_a-zA-Z]+[a-zA-Z$\d_]*/

export const readMinipBinder = (s: string, i: number): [string, string] | null => {
    if (s.substring(i, i + 2) === '{{') {
        const binder = readMiniBinder(s, i)
        if (binder) {
            return [binder, binder.slice(2, -2)]
        }
    }
    return null
}

export const readString = (s: string, i: number): [string, string] | null => {
    const ch = s.charAt(i)
    if(['"', "'"].indexOf(ch) > -1) {
        const str = readQuote(s, i)
        if(str) {
            return [str, str.slice(1, -1)]
        }
    }
    return null
}