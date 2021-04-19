import { TToken } from '../type'
import { TJsonTokenType } from './type'
import { read } from './readers'

const parse_braces = (node: TToken<TJsonTokenType>) => {
    const arr: [string?, any?][] = []
    let cursor: [string?, any?] = []
    let n = node.first, i = 0
    while(n) {
        switch(n.type) {
            case 'colon':
                i = 1
                break
            case 'comma':
                i = 0
                break
            case 'braces-end':
            case 'blank':
                break
            default:
                cursor[i] = parse_value(n)
                if(cursor.length > 1) {
                    arr.push(cursor)
                    cursor = []
                }
                console.log(2222, 'len', cursor.length)
                break
        }
        n = n.next
    }
    return arr
        .filter(c => c.length === 2 && typeof c[0] === 'string')
        .reduce((r, [key, value]) => ({ [key]: value, ...r }), {})
    return arr
}

const parse_bracket = (node: TToken<TJsonTokenType>) => {
    const arr: TToken<TJsonTokenType>[] = []
    let n = node.first, i = 0
    while(n) {
        switch(n.type) {
            case 'comma':
                i += 1
                break
            default:
                arr[i] = n
                break
        }
        n = n.next
    }
    return arr.map(n => n ? parse_value(n) : void(0))
}

const parse_parentheses = (node: TToken<TJsonTokenType>) => {
    let n = node.first
    if(!n) {
        return void(0)
    }
    while(n.next) {
        n = n.next
    }
    return parse_value(n)
}

const parse_value = (node: TToken<TJsonTokenType>) => {
    if(!node) {
        return void(0)
    }

    switch(node.type) {
        case 'null': return null
        case 'undefined': return void(0)
        case 'quote': return node.value.slice(1, -1)
        case 'plain': return node.value
        case 'number': return Number(node.value)
        case 'bracket': return parse_bracket(node)
        case 'braces': return parse_braces(node)
        case 'parentheses': return parse_parentheses(node)
    }
}


export const parse = (content: string) => {
    const node = read(content)
    let n = node
    while(n.next) {
        n = n.next
    }
    return parse_value(n)
}