import { TTokenBase, TToken, TTokenLite } from "./type"

export const getFirstNode = <T>(node: TToken<T> | TTokenLite<T>) => {

    if(!node) {
        return null
    }

    while(node.parent) {
        node = node.parent
    }

    let n: any = node

    while(n.previous) {
        n = n.previous
    }

    return n
}

export const readQuote = (str: string, start: number = 0): string => {
    const q = str.charAt(start)
    let end = -1
    for(let i = start + 1; i < str.length; i++) {
        const ch = str.charAt(i)
        if(ch === '\\') {
            i += 1
            continue
        } else if(ch === q) {
            end = i + 1
            break
        }
    }
    if(end > start) {
        return str.substring(start, end)
    }
    return null
}