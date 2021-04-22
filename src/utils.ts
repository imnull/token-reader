export const readQuoteIndex = (str: string, start: number = 0): number => {
    const q = str.charAt(start)
    for(let i = start + 1; i < str.length; i++) {
        const ch = str.charAt(i)
        if(ch === q) {
            return i + 1
        } if(ch === '\\') {
            i += 1
            continue
        }
    }
    return -1
}

export const readQuote = (str: string, start: number = 0): string => {
    const end = readQuoteIndex(str, start)
    if(end < 0) return null
    return str.substring(start, end)
}

const NEST: { [k: string]: string } = { '{': '}', '[': ']', '(': ')' }
const QUOTE: string = '`"\''

export const readNestIndex = (str: string, start: number) => {
    const left = str.charAt(start)
    if(!(left in NEST)) {
        return -1
    }
    const right = NEST[left]
    for(let i = start + 1, len = str.length; i < len; i++) {
        const ch = str.charAt(i)
        if(ch === right) {
            return i + 1
        } else if(QUOTE.indexOf(ch) > -1) {
            const end = readQuoteIndex(str, i)
            if(end < 0) {
                return -1
            }
            i = end - 1
        } else if(ch in NEST) {
            const end = readNestIndex(str, i)
            if(end < 0) {
                return -1
            }
            i = end - 1
        }
    }
    return -1
}

export const readMiniBinderIndex = (str: string, start: number = 0): number => {
    const head = str.substring(start, start + 2)
    if(head !== '{{') {
        return -1
    }
    const right = '}}'
    for(let i = start + 2, len = str.length; i < len; i++) {
        const ch = str.charAt(i)
        if(str.substring(i, i + 2) === right) {
            return i + 2
        } else if(QUOTE.indexOf(ch) > -1) {
            const end = readQuoteIndex(str, i)
            if(end < 0) {
                return -1
            }
            i = end - 1
        } else if(ch in NEST) {
            const end = readNestIndex(str, i)
            if(end < 0) {
                return -1
            }
            i = end - 1
        }
    }
    return -1
}

export const readMiniBinder = (str: string, start: number = 0): string | null => {
    const end = readMiniBinderIndex(str, start)
    if(end < 0) {
        return null
    }
    return str.substring(start, end)
}