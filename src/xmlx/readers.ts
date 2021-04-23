import { readQuote } from '../utils'
import { tokenReader, charReader } from '../reader'
import { readMinipBinder } from '../readers'
import { TXmlTokenType as T } from './type'

const isElementType = (token: any) => {
    return token && token.nest === 1 && ['element'].indexOf(token.type) > -1 
}

const readers = [
    tokenReader<T>('element', (s, i, parent) => {
        if(isElementType(parent)) {
            return null
        }
        const m = s.substring(i).match(/^<([a-z][^\s\<\>\/]*)/i)
        if(!m) {
            return null
        }
        return [m[0], m[1]]
    }, 1),
    tokenReader<T>('comment', (s, i, parent) => {
        if(isElementType(parent)) {
            return null
        }
        const m = s.substring(i).match(/^\<\!\-\-([\w\W]*?)\-\-\>|^\<\!\-\-+\>/)
        if(!m) {
            return null
        }
        return [m[0], m[1] || '']
    }, 0),
    tokenReader<T>('instruction', (s, i, parent) => {
        if(isElementType(parent)) {
            return null
        }
        return readMinipBinder(s, i)
    }, 0),
    tokenReader<T>('element-end', (s, i, parent) => {
        if(isElementType(parent) && s.charAt(i) === '>') {
            return '>'
        }
        return null
    }, 2),
    tokenReader<T>('element-single', (s, i, parent) => {
        if(!isElementType(parent)) {
            return null
        }
        const m = s.substring(i).match(/^\/\s*\>/)
        if(!m) {
            return null
        }
        return m[0]
    }, 2),
    tokenReader<T>('element-close', (s, i, parent) => {
        if(isElementType(parent)) {
            return null
        }
        const m = s.substring(i).match(/^\<\/([^\s\=\>\/]+)[^>]*>/)
        if(!m) {
            return null
        }
        return [m[0], m[1]]
    }, 0),
    tokenReader<T>('element-blank', (s, i, parent) => {
        if(isElementType(parent)) {
            const m = s.substring(i).match(/^\s+/)
            if(!m) {
                return null
            }
            return m[0]
        }
        return null
    }, 0),
    tokenReader<T>('attribute-equal', (s, i, parent, previous) => {
        if(isElementType(parent) && previous && previous.type === 'attribute-name' && s.charAt(i) === '=') {
            return '='
        }
        return null
    }, 0),
    tokenReader<T>('attribute-name', (s, i, parent, previous) => {
        if(isElementType(parent) && previous && previous.type !== 'attribute-equal') {
            const m = s.substring(i).match(/^[^\s][^\s\=\>\/]*/)
            if(!m) {
                return null
            }
            return m[0]
        }
        return null
    }, 0),
    tokenReader<T>('attribute-value', (s, i, parent, previous) => {
        if(isElementType(parent) && previous && previous.type === 'attribute-equal') {
            if(['"', "'"].indexOf(s.charAt(i)) > -1) {
                const quote = readQuote(s, i)
                if(!quote) {
                    const m = s.substring(i).match(/^[^\s\>\/]+/)
                    if(!m) {
                        return null
                    }
                    return m[0]
                } else {
                    return quote
                }
            } else {
                const m = s.substring(i).match(/^[^\s\>\/]+/)
                if(!m) {
                    return null
                }
                return m[0]
            }
        }
        return null
    }, 0),
    
]

export const read = charReader<T>(readers, 'text')