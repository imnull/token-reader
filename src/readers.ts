import { readMiniBinder, readQuote } from './utils'

export const REG_BREAK = /^$|^[\s\,\;\:\"\'\`\(\)\[\]\{\}]/
export const REG_NUMBER = /([\+\-]\s*)?([\d\.]+[eE][\+\-]?\d+|0?\.\d+|[1-9]\d*(\.(\d+)?)?|0)/
export const REG_ID = /[\$_a-zA-Z]+[a-zA-Z$\d_]*/
// 2021-04-22T02:37:47.000Z
export const REG_DATE = /\d{4}(\-\d{2}){0,2}[tT]\d{2}\:\d{2}(\:\d{2}(\.\d{1,3})?)?[zZ]?/

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