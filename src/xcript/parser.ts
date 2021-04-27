import { createReaderCallback as jsonxCreateReaderCallback, TJsonTokenType as J } from '../jsonx/index'
import { combinTokenParserCallback } from '../reader'
import { TParser, TReaderCallbackFactory as TRCF, TToken } from '../type'
import { Scope, ScopeItem } from './scope'

import { TXcriptTokenType as X } from './type'
import { read } from './readers'
import { binary, logical, unary } from './helper'

import { BranchNode, traverse } from '../branch'
import {
    TAstNode,
    TNode,
    TBinaryOperator,
    TLogicalOperator,
    TUnaryOperator,
    Program,
    NumberLiteral,
    StringLiteral,
    Null,
    Undefined,
    Identifier,
    BinaryExpression,
    BooleanLiteral,
    LogicalExpression,
    UnaryExpression,
} from './ast'

type TT = X | J

const MAP: { [k in TT]?: { (token: TToken<TT>, parent: TNode): TNode } } = {
    'number': (token, parent) => new NumberLiteral(parent, Number(token.value)),
    'string': (token, parent) => new StringLiteral(parent, token.value),
    'boolean': (token, parent) => new BooleanLiteral(parent, token.value === 'true'),
    'null': (token, parent) => new Null(parent),
    'undefined': (token, parent) => new Undefined(parent),
    'binary': (token, parent) => new BinaryExpression(parent, token.value as TBinaryOperator),
    'logical': (token, parent) => new LogicalExpression(parent, token.value as TLogicalOperator),
    'unary': (token, parent) => new UnaryExpression(parent, token.value as TUnaryOperator),
}

export const createCallback: TRCF<any[], TT> = (stack, scope: Scope) => (token, prev: TToken<TT>, next: TToken<TT>) => {

    console.log(9, token.type, token.value, prev && prev.type, next && next.type)

    switch(token.type) {
        case 'binary': {
            const left = stack.pop()
            const op = binary[token.value]
            const fn = (right: any) => op(left, right)
            stack.push(fn)
            return true
        }
        case 'logical': {
            const left = stack.pop()
            const op = logical[token.value]
            const fn = (right: any) => op(left, right)
            stack.push(fn)
            return true
        }
        case 'unary': {
            stack.push(unary[token.value])
            return true
        }
        case 'declare': {
            const declare = (name: any) => {
                const item = scope.declare(name, token.value)
                return item
            }
            stack.push(declare)
            return true
        }
        case 'assign': {
            const last = stack[stack.length - 1]
            if(last && last instanceof ScopeItem) {
                const item = stack.pop()
                stack.push((val: any) => item.setValue(val))
            }
            return true
        }
        case 'comma': {
            const last = stack[stack.length - 1]
            if(last && last instanceof ScopeItem) {
                const declare = (name: any) => {
                    const it = stack.pop()
                    const item = scope.declare(name, scope.getKind(it.name))
                    return item
                }
                stack.push(declare)
                return true
            }
            return false
        }
        case 'id': {
            // const last = stack[stack.length - 1]
            // if(typeof last === 'function') {
            //     stack.push(token.value)
            //     return true
            // }
            if(token.parent && (
                (token.parent.type === 'bracket-wind' && prev && prev.type === 'colon') ||
                (token.parent.type === 'bracket-square')
            )) {
                stack.push(scope.extract(token.value).getValue())
                return true
            }
            if(!token.parent && prev && prev.type === 'comma') {
                stack.push(scope.declare(token.value, 'var'))
                return true
            }
            if(prev && prev.type === 'assign') {
                console.log(55555, token.value, scope.getValue(token.value))
                stack.push(scope.getValue(token.value))
            }
            return false
        }
    }
    return false
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

export const createReaderCallback = combinTokenParserCallback((stack, token) => {
    // console.log(token.readerGroup, token.type, token.value)
    reduceStack(stack)
}, createCallback, jsonxCreateReaderCallback)

export const parse: TParser = (content: string, start: number = 0) => {

    const program = new Program()
    let cursor: TNode = program
    read(content, token => {
        // console.log(111111, token)
        const node = MAP[token.type](token, cursor)
        cursor = cursor.append(node) as TNode
        return true
    }, start)

    console.log(program.body[0])

    // const program = new BranchNode<TToken<TT>>({ type: 'program' } as TToken<TT>)
    // let cursor = program
    // read(content, (token) => {
    //     const node = cursor.appendToken(token)
    //     if(node.value.type === 'declare') {
    //         cursor = node
    //     } else if(cursor.value.type === 'declare') {
    //         if(token.type !== 'id' && token.type !== 'assign' && token.type !== 'comma') {
    //             cursor.remove(node)
    //             cursor = cursor.parent
    //             cursor.append(node)
    //         }
    //     }
    //     node.value.parent = cursor.value
    //     return true
    // }, start)

    // const stack: any[] = []
    // const scope = new Scope()
    // const callback = createReaderCallback(stack, scope)

    // traverse<TToken<TT>>(program, ({ value: token, parent, next, previous }) => {
    //     console.log(token.readerGroup, token.type, token.value, parent && parent.value.type) //, previous && previous.value && previous.value.type, next && next.value && next.value.type
    //     // callback(token, previous && previous.value, next && next.value)
    // })

    // console.log('stack ->', stack)
    // console.log('scope ->', scope)
}