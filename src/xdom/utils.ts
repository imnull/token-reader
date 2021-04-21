import { TTraverseTester, TTraverseNode, TNodeBase } from "./type"

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