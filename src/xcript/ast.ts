
export type TAstNodeType = 'Program' | 'Null' | 'Undefined' | 'NumberLiteral' | 'StringLiteral' | 'Identifier'
export type TAstNode = {
    type: TAstNodeType
}

export type TProgram = { body: TAstNode[] } & TAstNode
export class Program implements TProgram {
    public get type() {
        return 'Program' as TAstNodeType
    }

    public readonly body: TAstNode[]
    public constructor() {
        this.body = []
    }
}

export type TNumberLiteral = { value: number } & TAstNode
export class NumberLiteral implements TNumberLiteral {
    public get type() {
        return 'NumberLiteral' as TAstNodeType
    }

    public value: number
    public constructor(value: number) {
        this.value = value
    }
}

export type TStringLiteral = { value: string } & TAstNode
export class StringLiteral implements TStringLiteral {
    public get type() {
        return 'NumberLiteral' as TAstNodeType
    }

    public value: string
    public constructor(value: string) {
        this.value = value
    }
}

export type TIdentifier = { name: string } & TAstNode
export class Identifier implements TIdentifier {
    public get type() {
        return 'Identifier' as TAstNodeType
    }

    public name: string
    public constructor(name: string) {
        this.name = name
    }
}

export type TUndefined = { value: undefined } & TAstNode
export class Undefined implements TUndefined {
    public get type() {
        return 'Undefined' as TAstNodeType
    }
    public get value() {
        return void(0)
    }
}

export type TNull = { value: null } & TAstNode
export class Null implements TNull {
    public get type() {
        return 'Null' as TAstNodeType
    }
    public get value() {
        return null
    }
}