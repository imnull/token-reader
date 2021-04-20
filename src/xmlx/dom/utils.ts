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