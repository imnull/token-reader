import { TTokenBase, TToken } from "./type"

export const getFirstNode = <T>(node: TToken<T>) => {

    if(!node) {
        return null
    }

    while(node.parent) {
        node = node.parent
    }

    while(node.previous) {
        node = node.previous
    }

    return node
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