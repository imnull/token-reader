import { jsonx } from './src'
import { TTokenLite } from './src/type'
import { TJsonTokenType } from './src/jsonx/type'

let code = `callback(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]))`
code = `(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]))`
// code = `  { 'a1   b': 1, _xyz: 3 }  `
// code = `[1,2,3]`
// code = `  { 'a1   b': 1, _xyz: 3, arr: [3,4,5,,,,,89   ] }  `
// code = `  (1,[12,3,4],3,{xyz:123},[12,3,4,{a:[5,6,7,,,,8]},[5,6,7,,,,8]])  `
// code = `  abc  `
// code = `[{ a: 1, b: 2 },,2,,,,,[1,{x:1}],,,9]`
// code = `{ a: 1, b: 2 }`
// code = `1,,1,2,,3,4,5,6,,2,3)`
// code = `(1,2,3)`

const getNodeValue = (node: TTokenLite<TJsonTokenType>) => {
    switch(node.originType) {
        case 'number':
            return Number(node.value)
        case 'null':
            return null
        case 'undefined':
            return void(0)
        case 'parentheses':
            return node
        case 'braces':
            return {}
        case 'bracket':
            return []
    }
    return node.value
}

const stack: any[] = []

const isParenthesesStack = (stack: any[]) => {
    const last0 = stack[stack.length - 1]
    const last1 = stack[stack.length - 2]
    if(last0 && last0.type === 'parentheses') {
        return false
    }
    return last1 && last1.type === 'parentheses'
}

const stackPush = (value: any, ignore: boolean = false) => {
    if(!ignore && isParenthesesStack(stack)) {
        stack.pop()
    }
    stack.push(value)
}

const update = (stack: any[], node: TTokenLite<TJsonTokenType>) => {
    const lastBefore = stack[stack.length - 2]
    // if(
    //     lastBefore && typeof lastBefore === 'object' && lastBefore.type === 'parentheses'
    //     && lastBefore.depth + 1 === node.depth
    // ) {
    //     if(node.type === 'parentheses-end') {
    //         const keep = stack.pop()
    //         stack.pop()
    //         stack.push(keep)
    //         return
    //     } else {
    //         stack.pop()
    //     }
    // }

    switch(node.type) {
        case 'parentheses':
            if(!node.parent) {
                stack.splice(0, stack.length)
            }
            stackPush(getNodeValue(node), true)
            break
        case 'parentheses-end':
            const val = stack.pop()
            stack[stack.length - 1] = val
            break
        case 'braces':
            stackPush(getNodeValue(node), true)
            stackPush('', true)
            break
        case 'bracket':
            stackPush(getNodeValue(node), true)
            stackPush(0, true)
            break
        case 'braces-end':
        case 'bracket-end':
            stack.pop()
            if(stack.length > 2) {
                const val = stack.pop()
                const key = stack[stack.length - 1]
                stack[stack.length - 2][key] = val
            }
            break
        case 'property-name':
            stack[stack.length - 1] = getNodeValue(node)
            break
        case 'property-value':
            const name: string = stack[stack.length - 1]
            stack[stack.length - 2][name] = getNodeValue(node)
            break
        case 'array-comma':
            stack[stack.length - 1] += 1
            break
        case 'array-value':
            const key = stack[stack.length - 1]
            stack[stack.length - 2][key] = getNodeValue(node)
            break
        default:
            stackPush(getNodeValue(node))
            break
    }
    
}

jsonx.read(code, node => {
    console.log([node.depth, node.type, node.start, node.end, node.value, node.originType])
    switch(node.type) {
        case 'id':
        case 'string':
        case 'number':
        case 'null':
        case 'undefined':
        case 'braces':
        case 'braces-end':
        case 'bracket':
        case 'bracket-end':
        case 'property-name':
        case 'property-value':
        case 'array-value':
        case 'array-comma':
        case 'parentheses':
        case 'parentheses-end':
            update(stack, node)
            break
        
    }
})

console.log(1111, stack)
