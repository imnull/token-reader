import { TToken } from '../type'
import { TXcriptTokenType as X } from './type'
import { read } from './readers'
import { binary } from './helper'

const getTokenValue = (token: TToken<X>) => {
    switch(token.originType) {
        case 'string': return token.value
        case 'number': return Number(token.value)
        case 'undefined': return void(0)
        case 'null': return null
    }
    return token
}

const getLastToken = (stack: any[]) => {
    return stack[stack.length - 1] || null
}

const isToken = (token: any): token is TToken<X> => {
    if(!token || typeof token !== 'object' || Array.isArray(token)) {
        return false
    }
    return 'type' in token && 'originType' in token
}

const isValueToken = (token: TToken<X>) => {
    return ['string', 'number', 'undefined', 'null'].includes(token.originType)
}

class ScopeItem {
    public readonly name: string
    private readonly parent: Scope
    constructor(name: string, parent: Scope) {
        this.name = name
        this.parent = parent
    }

    getValue() {
        return this.parent.getValue(this.name)
    }
    setValue(val: any) {
        return this.parent.setValue(this.name, val)
    }
}
class Scope {
    private readonly scope: { [key: string]: { status: 0 | 1, value: any, kind: string } }

    constructor() {
        this.scope = {}
    }

    private getValueItem(name: string): { status: 0 | 1, value: any } {
        const item = this.scope[name]
        if(!item) {
            const err = new Error(`${name} is not defined`)
            err.name = 'ReferenceError'
            throw err
        }
        return item
    }

    getValue(name: string) {
        const item = this.getValueItem(name)
        return item.status === 1 ? item.value : void(0)
    }

    setValue(name: string, value: any) {
        const item = this.getValueItem(name)
        item.status = 1
        item.value = value
    }

    extract(name: string) {
        return new ScopeItem(name, this)
    }

    declare(name: string, kind: string) {
        this.scope[name] = {
            kind,
            status: 0,
            value: void(0)
        }
        return this.extract(name)
    }

}

type TUpdate = { (options: { env: Scope, token: TToken<X>, stack: any[] }): TUpdate }

const createError = (token: TToken<X>, name = 'SyntaxError') => {
    const err = new Error(`Unexpected '${token.type}'`)
    err.name = name
    err.message = 'abc'
    return err
}

const update: TUpdate = ({ stack, env, token }) => {
    const reducer = resolves.find(({ types }) => types.includes(token.type))
    if(!reducer) {
        return update
    }
    const next = reducer.reduce({ stack, env, token })
    return next
}

const resolves: { types: X[], reduce: TUpdate }[] = [
    {
        types: ['null', 'undefined', 'number', 'string'],
        reduce: ({ stack, token }) => {
            stack.push(getTokenValue(token))
            return update
        }
    },
    {
        types: ['declare'],
        reduce: ({ token: declare }) => {
            const reduceId = ({ env, token: id }) => {
                if(id.type === 'id') {
                    const item = env.declare(id.value, declare.value)
                    const reduceFlag: TUpdate = ({ token: flag }) => {
                        switch(flag.type) {
                            case 'assign':
                                return ({ token: value, stack, env }) => {
                                    let next = update({ stack, env, token: value })
                                    return ({ token, ...rest }) => {
                                        switch(token.type) {
                                            case 'comma': return reduceId
                                            default:
                                                next = next({ ...rest, token })
                                                console.log(1111, stack)
                                                return next
                                        }
                                    }
                                }
                            case 'comma':
                                return reduceId
                        }
                        throw createError(flag)
                    }
                    return reduceFlag
                } else {
                    throw createError(id)
                }
            }
            return reduceId
        }
    },
    {
        types: ['id'],
        reduce: ({ token, stack, env }) => {
            stack.push(env.getValue(token.value))
            return update
        }
    },
    {
        types: ['binary'],
        reduce: ({ token: bin, stack }) => {
            console.log(2222, stack)
            return ({ token }) => {
                const left = stack.pop()
                const op = binary[bin.value]
                stack.push(op(left, getTokenValue(token)))
                return update
            }
        }
    }
]


type TAstNode = {
    type: X
    count: number
    value: string
    parent: TAstNode
    next: TAstNode
    prev: TAstNode
    first: TAstNode
    last: TAstNode
}

const remove = (child: TAstNode) => {
    const { parent = null, next = null, prev = null } = child
    if(parent) {
        if(parent.first === child) {
            parent.first = next
        }
        if(parent.last === child) {
            parent.last = prev
        }
        parent.count -= 1
    }

    if(prev) {
        prev.next = next
    }
    if(next) {
        next.prev = prev
    }
}

const append = (parent: TAstNode, child: TAstNode) => {
    remove(child)
    child.parent = parent || null
    if(parent) {
        if(!parent.first) {
            parent.first = child
            parent.last = child
            child.prev = child.next = null
        } else {
            child.next = null
            child.prev = parent.last
            parent.last.next = child
            parent.last = child
        }
        parent.count += 1
    }
    return child
}

const createNode = (token: TToken<X>): TAstNode => {
    return {
        type: token.type,
        value: token.value,
        count: 0,
        parent: null,
        next: null,
        prev: null,
        first: null,
        last: null
    }
}

export const parse = (content: string) => {
    const env = new Scope()

    const program: TAstNode = {
        count: 0,
        type: 'program',
        value: null,
        parent: null,
        next: null,
        prev: null,
        first: null,
        last: null
    }
    let cursor = program
    read(content, token => {
        const node = createNode(token)
        if(node.type === 'binary') {
            const parent = cursor.parent
            append(node, cursor)
            append(parent, node)
            cursor = node
        } else if(cursor.type === 'binary') {
            append(cursor, node)
            cursor = cursor.parent
        } else {
            cursor = append(cursor, node)
        }
        console.log([token.depth, token.type, token.value])
        // next = next({ stack, env, token })
    })

    console.log(cursor)
}