import { createReaderCallback as jsonxCreateReaderCallback } from '../jsonx/index'
import { combinParserCallbackFactory } from '../reader'
import { TParser, TReaderCallbackFactory } from '../type'

import { TXcriptTokenType as X } from './type'
import { read } from './readers'
import { binary } from './helper'

const BINARY_SYMBOL = { type: 'binary' }

export const createCallback: TReaderCallbackFactory<any[], X> = stack => token => {
    if(token.type === 'binary') {
        const left = stack.pop()
        const op = binary[token.value]
        const fn = (right: any) => op(left, right)
        stack.push(fn)
    }
}

export const createReaderCallback = combinParserCallbackFactory((token, stack) => {
    console.log(token.readerGroup, token.type, token.value)
    const reducer = stack[stack.length - 2]
    if(typeof reducer === 'function') {
        const val = stack.pop()
        const reduce = stack.pop()
        stack.push(reduce(val))
    }
}, createCallback, jsonxCreateReaderCallback)

export const parse: TParser = (content: string, start: number = 0) => {
    const stack: any[] = []
    const callback = createReaderCallback(stack)
    read(content, callback, start)
    console.log('stack ->', stack)
}