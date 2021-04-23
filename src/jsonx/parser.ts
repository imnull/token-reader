import { TToken } from '../type'
import { TJsonTokenType } from './type'
import { read } from './readers'

const PARENTHESES_SYMBOL = { type: 'parentheses' }
const BRACES_SYMBOL = { type: 'braces' }
const BRACKET_SYMBOL = { type: 'bracket' }

const getNodeValue = (node: TToken<TJsonTokenType>) => {
    switch(node.originType) {
        case 'number':
            return Number(node.value)
        case 'date':
            return new Date(node.value)
        case 'null':
            return null
        case 'undefined':
            return void(0)
        case 'parentheses':
            return PARENTHESES_SYMBOL
        case 'braces':
            return BRACES_SYMBOL
        case 'bracket':
            return BRACKET_SYMBOL
    }
    return node.value
}

const endNest = (stack: any[], type: any) => {

    let finVal = stack.pop(), resurse: any[] = []
    while(stack.length > 0 && stack[stack.length - 1] !== type) {
        resurse.push(stack.pop())
    }

    if(resurse.length === 2) {
        resurse[1][resurse[0]] = finVal
        finVal = resurse[1]
    }
    if(stack.length > 0) {
        stack.pop()
    }
    stack.push(finVal)
}

const stepUp = (stack: any[], type: any) => {
    let step: number = 0
    for(let i = stack.length - 1; i >= 0; i--) {
        if(stack[i] === type) {
            break
        }
        step += 1
    }
    return step
}

const emptyStack = (stack: any[], type: any, clear: boolean = false) => {
    while(stack.length > 0 && stack[stack.length - 1] !== type) {
        stack.pop()
    }
    if(stack.length > 0 && clear) {
        stack.pop()
    }
}

const update = (stack: any[], node: TToken<TJsonTokenType>) => {
    switch(node.type) {
        case 'parentheses':
            stack.push(getNodeValue(node))
            stack.push(void(0))
            break
        case 'parentheses-comma':
            if(stepUp(stack, PARENTHESES_SYMBOL) === 2) {
                const tmp = stack.pop()
                stack[stack.length - 1] = tmp
            }
            break
        case 'parentheses-end':
            const parenthesesVal = stack.pop()
            emptyStack(stack, PARENTHESES_SYMBOL, true)
            stack.push(parenthesesVal)
            break
        case 'braces':
            stack.push(getNodeValue(node))
            stack.push({})
            break
        case 'braces-comma':
            if(stepUp(stack, BRACES_SYMBOL) === 3) {
                const propVal = stack.pop()
                const propName = stack.pop()
                stack[stack.length - 1][propName] = propVal
            }
            break
        case 'braces-end':
            if(stepUp(stack, BRACES_SYMBOL) === 2) {
                stack.push(stack[stack.length - 1])
            }
            endNest(stack, BRACES_SYMBOL)
            break
        case 'bracket':
            stack.push(getNodeValue(node))
            stack.push([])
            stack.push(0)
            break
        case 'bracket-comma':
            const settingStep = stepUp(stack, BRACKET_SYMBOL)
            if(settingStep === 3) {
                let arrVal = stack.pop()
                let arrIdx = stack.pop()
                stack[stack.length - 1][arrIdx] = arrVal
                stack.push(arrIdx + 1)
            } else if(settingStep === 2) {
                stack[stack.length - 1] += 1
            }
            break
        case 'bracket-end':
            if(stepUp(stack, BRACKET_SYMBOL) === 2) {
                stack.pop()
            }
            endNest(stack, BRACKET_SYMBOL)
            break
        case 'id':
        case 'date':
        case 'string':
        case 'number':
        case 'null':
        case 'undefined':
            stack.push(getNodeValue(node))
            break
    }
    
}

export const parse = (content: string) => {
    const stack: any[] = []
    read(content, node => {
        update(stack, node)
    })
    return stack.pop()
}