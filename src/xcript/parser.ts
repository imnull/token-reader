import { createReaderCallback as jsonxCreateReaderCallback } from '../jsonx/index'
import { combinTokenParserCallback } from '../reader'
import { TParser, TReaderCallbackFactory as TRCF } from '../type'

import { TXcriptTokenType as X } from './type'
import { read } from './readers'
import { binary, logical, unary } from './helper'

export const createCallback: TRCF<any[], X> = stack => token => {
    switch(token.type) {
        case 'binary': {
            const left = stack.pop()
            const op = binary[token.value]
            const fn = (right: any) => op(left, right)
            stack.push(fn)
            break
        }
        case 'logical': {
            const left = stack.pop()
            const op = logical[token.value]
            const fn = (right: any) => op(left, right)
            stack.push(fn)
            break
        }
        case 'unary': {
            stack.push(unary[token.value])
            break
        }
        
    }
}

const reduceStack = (stack: any[]) => {
    if(typeof stack[stack.length - 2] === 'function') {
        const val = stack.pop()
        let reduce = stack.pop()
        if(typeof val === 'function') {
            stack.push((v: any) => reduce(val(v)))
        } else {
            stack.push(reduce(val))
        }
        
    }
}

export const createReaderCallback = combinTokenParserCallback((token, stack) => {
    console.log(token.readerGroup, token.type, token.value)
    reduceStack(stack)
}, createCallback, jsonxCreateReaderCallback)

export const parse: TParser = (content: string, start: number = 0) => {
    const stack: any[] = []
    const callback = createReaderCallback(stack)
    read(content, callback, start)
    console.log('stack ->', stack)
}