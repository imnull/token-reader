import { createReaderCallback as jsonxCreateReaderCallback } from '../jsonx/index'
import { combinParserCallbackFactory } from '../reader'
import { TParser, TReaderCallbackFactory } from '../type'

import { TXcriptTokenType as X } from './type'
import { read } from './readers'
import { binary } from './helper'

const BINARY_SYMBOL = { type: 'binary' }

export const createCallback: TReaderCallbackFactory<any[], X> = stack => token => {
    if(token.type === 'binary') {
        stack.push(BINARY_SYMBOL)
    }
}

export const createReaderCallback = combinParserCallbackFactory(token => {
    console.log(token.readerGroup, token.type, token.value)
}, createCallback, jsonxCreateReaderCallback)

export const parse: TParser = (content: string, start: number = 0) => {
    const stack: any[] = []
    const callback = createReaderCallback(stack)
    read(content, callback, start)
    console.log('stack ->', stack)
}