import { TToken, TParser, TReaderCallbackFactory } from '../type'
import { TJsonTokenType as J } from './type'
import { read } from './readers'

const BRACKET_ROUND_SYMBOL = { type: 'bracket-round' }
const BRACKET_WIND_SYMBOL = { type: 'bracket-wind' }
const BRACKET_SQUARE_SYMBOL = { type: 'bracket-square' }

const getNodeValue = (node: TToken<J>) => {
    switch(node.originType) {
        case 'number':
            return Number(node.value)
        case 'date':
            return new Date(node.value)
        case 'boolean':
            return node.value === 'true'
        case 'null':
            return null
        case 'undefined':
            return void(0)
        case 'bracket-round':
            return BRACKET_ROUND_SYMBOL
        case 'bracket-wind':
            return BRACKET_WIND_SYMBOL
        case 'bracket-square':
            return BRACKET_SQUARE_SYMBOL
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

const update = (stack: any[], node: TToken<J>): boolean => {
    switch(node.type) {
        case 'bracket-round':
            stack.push(getNodeValue(node))
            stack.push(void(0))
            return true
        case 'bracket-round-comma':
            if(stepUp(stack, BRACKET_ROUND_SYMBOL) === 2) {
                const tmp = stack.pop()
                stack[stack.length - 1] = tmp
            }
            return true
        case 'bracket-round-end':
            const parenthesesVal = stack.pop()
            emptyStack(stack, BRACKET_ROUND_SYMBOL, true)
            stack.push(parenthesesVal)
            return true
        case 'bracket-wind':
            stack.push(getNodeValue(node))
            stack.push({})
            return true
        case 'bracket-wind-comma':
            if(stepUp(stack, BRACKET_WIND_SYMBOL) === 3) {
                const propVal = stack.pop()
                const propName = stack.pop()
                stack[stack.length - 1][propName] = propVal
            }
            return true
        case 'bracket-wind-end':
            if(stepUp(stack, BRACKET_WIND_SYMBOL) === 2) {
                stack.push(stack[stack.length - 1])
            }
            endNest(stack, BRACKET_WIND_SYMBOL)
            return true
        case 'bracket-square':
            stack.push(getNodeValue(node))
            stack.push([])
            stack.push(0)
            return true
        case 'bracket-square-comma':
            const settingStep = stepUp(stack, BRACKET_SQUARE_SYMBOL)
            if(settingStep === 3) {
                let arrVal = stack.pop()
                let arrIdx = stack.pop()
                stack[stack.length - 1][arrIdx] = arrVal
                stack.push(arrIdx + 1)
            } else if(settingStep === 2) {
                stack[stack.length - 1] += 1
            }
            return true
        case 'bracket-square-end':
            if(stepUp(stack, BRACKET_SQUARE_SYMBOL) === 2) {
                stack.pop()
            }
            endNest(stack, BRACKET_SQUARE_SYMBOL)
            return true
        case 'id':
        case 'date':
        case 'string':
        case 'number':
        case 'null':
        case 'boolean':
        case 'undefined':
            stack.push(getNodeValue(node))
            return true
    }
    return false
}

export const createReaderCallback: TReaderCallbackFactory<any[], J> = stack => node => {
    return update(stack, node)
}

export const parse: TParser = (content, start = 0) => {
    const stack: any[] = []
    const callback = createReaderCallback(stack)
    read(content, callback, start)
    return stack.pop()
}