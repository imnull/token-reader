import { TTraverseTester, TTraverseNode, TNodeBase } from "./type"
import { readMiniBinderIndex } from '../utils'

export const QUOTES = '"\''

export const quotify = (s: string, qs: string = QUOTES): { value: string, quote: string } => {
    if(s.length > 1) {
        const first = s.charAt(0)
        const last = s.charAt(s.length - 1)
        if(qs.indexOf(first) > -1 && first === last) {
            return { value: s.slice(1, -1), quote: first }
        }
    }
    return quotify(JSON.stringify(s), '"')
}

export const traverseTest = (node: TNodeBase, tester: TTraverseTester) => {
    if(typeof tester === 'string') {
        return node.nodeName === tester
    } else if(typeof tester === 'number') {
        return node.nodeType === tester
    } else if(Array.isArray(tester)) {
        const [type, t] = tester
        if(node.nodeType !== type) {
            return false
        }
        if(!t) {
            return true
        }
        return traverseTest(node, t)
    } else if(tester instanceof RegExp) {
        return tester.test(node.nodeName)
    } else {
        return tester(node)
    }
}

export const splitBinder = (str: string) => {
    const arr: { type: 'text' | 'binder', data: string }[] = []
    let start: number = 0
    for(let i = start, len = str.length; i < len; i++) {
        if(str.substring(i, i + 2) === '{{') {
            const end = readMiniBinderIndex(str, i)
            if(end > -1) {
                if(i > start) {
                    arr.push({ type: 'text', data: str.substring(start, i) })
                }
                arr.push({ type: 'binder', data: str.substring(i, end).slice(2, -2) })
                start = end
                i = start - 1
            }
        }
    }
    if(start < str.length) {
        arr.push({ type: 'text', data: str.substring(start) })
    }
    return arr
}