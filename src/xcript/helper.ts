export const binary: { [k: string]: { (a: any, b: any): any } } = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '%': (a, b) => a % b,
    '^': (a, b) => a ^ b,
    '|': (a, b) => a | b,
    '&': (a, b) => a & b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    '==': (a, b) => a == b,
    '!=': (a, b) => a != b,
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '>>': (a, b) => a >> b,
    '>>>': (a, b) => a >>> b,
    '<<': (a, b) => a << b,
}

export const unary: { [k: string]: { (v?: any): any } } = {
    '+': v => +v,
    '-': v => -v,
    '~': v => ~v,
    '!': v => !v,
    'typeof': v => typeof(v),
    'void': () => void 0,
}

export const logical: { [k: string]: { (a: any, b: any): boolean } }  = {
    '&&': (a, b) => a && b,
    '||': (a, b) => a || b,
}