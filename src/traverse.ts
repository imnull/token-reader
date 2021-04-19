import { TToken } from './type'

const traverseHelper = <T>(node: TToken<T>, callback: { (node: TToken<T>): void }) => {
    callback(node)
    let n: TToken<T>
    n = node.first
    while(n) {
        traverseHelper(n, callback)
        n = n.next
    }
}

const createTraverse = <T>() => {
    return (node: TToken<T>, callback: { (node: TToken<T>): void }) => {
        let n = node
        while(n) {
            traverseHelper(n, callback)
            n = n.next
        }
    }
}

export default createTraverse