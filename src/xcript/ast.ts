
export type TAstNodeType = 'Program'
    | 'Null' | 'Undefined' | 'NumberLiteral' | 'StringLiteral' | 'BooleanLiteral'
    | 'Identifier'
    | 'BinaryExpression' | 'LogicalExpression' | 'UnaryExpression' | 'ObjectExpression'
    | 'ObjectPattern' | 'Property'
    | 'VariableDeclaration' | 'VariableDeclarator'
    | 'BracketRound'

export type TAstNode = {
    type: TAstNodeType
    parent: TAstNode
    closed: boolean
    empty: boolean
    append(node: TAstNode): TAstNode
    pop(): TNode | null
    appendNode(node: TNode): void
    afterAppendTo(): TAstNode
}

export type TBinaryOperator = '+' | '-' | '*' | '/' | '%' | '^' | '|' | '&' | '>' | '>=' | '<' | '<=' | '==' | '!=' | '===' | '!==' | '>>' | '>>>' | '<<'
export type TLogicalOperator = '&&' | '||'
export type TUnaryOperator = '+' | '-' | '~' | '!' | 'typeof' | 'void'
export type TProgram = { type: 'Program', body: TNode[] } & TAstNode
export type TNumberLiteral = { type: 'NumberLiteral', value: number } & TAstNode
export type TStringLiteral = { type: 'StringLiteral', value: string } & TAstNode
export type TBooleanLiteral = { type: 'BooleanLiteral', value: boolean } & TAstNode
export type TIdentifier = { type: 'Identifier', name: string } & TAstNode
export type TUndefined = { type: 'Undefined', value: undefined } & TAstNode
export type TNull = { type: 'Null', value: null } & TAstNode
export type TBinaryExpression = { type: 'BinaryExpression', left: TNode, right: TNode, operator: TBinaryOperator } & TAstNode
export type TLogicalExpression = { type: 'LogicalExpression', left: TNode, right: TNode, operator: TLogicalOperator } & TAstNode
export type TUnaryExpression = { type: 'UnaryExpression', argument: TNode, operator: TUnaryOperator } & TAstNode
export type TObjectExpression = { type: 'ObjectExpression', properties: TNode[] } & TAstNode
export type TObjectPattern = { type: 'ObjectPattern', properties: TNode[] } & TAstNode
export type TProperty = { type: 'Property', key: TKeyNode, value: TValueNode } & TAstNode
export type TBracketRound = { type: 'BracketRound', nodes: TNode[] } & TAstNode
export type TVariableDeclaration = { type: 'VariableDeclaration', declarations: TVariableDeclarator[] } & TAstNode
export type TVariableDeclarator = { type: 'VariableDeclarator', id: TIdentifier, init: TValueNode } & TAstNode
export type TKeyNode = TIdentifier | TNumberLiteral | TStringLiteral | TBooleanLiteral
export type TValueNode =
    TUndefined | TNull
    | TNumberLiteral | TStringLiteral | TBooleanLiteral
    | TIdentifier
    | TBinaryExpression | TLogicalExpression | TUnaryExpression | TObjectExpression
    | TBracketRound
export type TNode =
    TProgram
    | TValueNode
    | TVariableDeclaration | TVariableDeclarator

class AstNode implements TAstNode {
    get closed() {
        return true
    }
    get empty() {
        return true
    }
    parent: TAstNode | null
    type: TAstNodeType
    appendNode(node: TNode) { }
    afterAppendTo(): TAstNode { return this }
    append(node: TAstNode) {
        if (this.closed) {
            return this.parent ? this.parent.append(node) : node
        } else {
            this.appendNode(node as TNode)
            node = (node.afterAppendTo() as TNode) || node
            let n = node
            while (n && n.closed) {
                n = n.parent as TNode
            }
            return n
        }
    }
    pop(): TNode { return null }
    constructor(parent?: TAstNode) {
        this.parent = parent || null
    }
}

export class Program extends AstNode implements TProgram {
    public get type(): 'Program' {
        return 'Program'
    }

    public get closed() {
        return false
    }

    public get empty() {
        return this.body.length < 1
    }

    public readonly body: TNode[]
    public constructor(parent?: TAstNode) {
        super(parent)
        this.body = []
    }

    appendNode(node: TNode) {
        node.parent = this
        this.body.push(node)
    }
    pop() {
        const node = this.body.pop()
        if (!node) {
            return null
        }
        node.parent = null
        return node
    }
}

export class NumberLiteral extends AstNode implements TNumberLiteral {
    public get type(): 'NumberLiteral' {
        return 'NumberLiteral'
    }

    public get closed() {
        return true
    }

    public value: number
    public constructor(parent: TAstNode, value: number) {
        super(parent)
        this.value = value
    }
}
export class StringLiteral extends AstNode implements TStringLiteral {
    public get type(): 'StringLiteral' {
        return 'StringLiteral'
    }

    public value: string
    public constructor(parent: TAstNode, value: string) {
        super(parent)
        this.value = value
    }
}

export class BooleanLiteral extends AstNode implements TBooleanLiteral {
    public get type(): 'BooleanLiteral' {
        return 'BooleanLiteral'
    }

    public value: boolean
    public constructor(parent: TAstNode, value: boolean) {
        super(parent)
        this.value = value
    }
}

export class Identifier extends AstNode implements TIdentifier {
    public get type(): 'Identifier' {
        return 'Identifier'
    }

    public name: string
    public constructor(parent: TAstNode, name: string) {
        super(parent)
        this.name = name
    }
}

export class Undefined extends AstNode implements TUndefined {
    public get type(): 'Undefined' {
        return 'Undefined'
    }
    public get closed() {
        return true
    }
    public get value() {
        return void (0)
    }
}

export class Null extends AstNode implements TNull {
    public get type(): 'Null' {
        return 'Null'
    }
    public get value() {
        return null
    }
}

const BinaryLevel = [
    ['>', '>=', '<', '<=', '==', '!=', '===', '!==', '>>', '>>>', '<<'],
    ['+', '-'],
    ['*', '/', '%', '^', '|', '&'],
]
export class BinaryExpression extends AstNode implements TBinaryExpression {

    public get type(): 'BinaryExpression' {
        return 'BinaryExpression'
    }
    public get closed() {
        return !!this.left && !!this.right
    }

    public operator: TBinaryOperator
    public left: TNode | null
    public right: TNode | null

    public constructor(parent: TAstNode, operator: TBinaryOperator, left?: TNode, right?: TNode) {
        super(parent)
        this.operator = operator
        this.left = left || null
        this.right = right || null
    }

    afterAppendTo() {
        const parent = this.parent
        const self = parent.pop() as TBinaryExpression
        const prev = parent.pop()

        if (prev.type === 'BinaryExpression') {
            const prevOrder = BinaryLevel.findIndex(op => op.includes(prev.operator))
            const selfOrder = BinaryLevel.findIndex(op => op.includes(self.operator))
            if (selfOrder > prevOrder) {
                const newNode = new BinaryExpression(null, self.operator)
                newNode.appendNode(prev.right)

                const newSelf = new BinaryExpression(null, prev.operator)
                newSelf.appendNode(prev.left)
                newSelf.appendNode(newNode)
                parent.appendNode(newSelf)
                return newNode
            }
        }
        self.appendNode(prev)
        parent.appendNode(self)
        return self
    }

    appendNode(node: TNode) {
        if (!this.left) {
            this.left = node
            this.left.parent = this
        } else if (!this.right) {
            this.right = node
            this.right.parent = this
        }
    }

    pop() {
        let output: TNode = null
        if (this.right) {
            output = this.right
            this.right = null
        } else if (this.left) {
            output = this.left
            this.left = null
        }
        if (output) {
            output.parent = null
        }
        return output
    }
}

export class LogicalExpression extends AstNode implements TLogicalExpression {

    public get type(): 'LogicalExpression' {
        return 'LogicalExpression'
    }
    public get closed() {
        return !!this.left && !!this.right
    }

    public operator: TLogicalOperator
    public left: TNode | null
    public right: TNode | null

    public constructor(parent: TAstNode, operator: TLogicalOperator, left?: TNode, right?: TNode) {
        super(parent)
        this.operator = operator
        this.left = left || null
        this.right = right || null
    }

    afterAppendTo() {
        const parent = this.parent
        const self = parent.pop() as TBinaryExpression
        const prev = parent.pop()
        self.appendNode(prev)
        parent.appendNode(self)
        return self
    }

    appendNode(node: TNode) {
        if (!this.left) {
            this.left = node
            this.left.parent = this
        } else if (!this.right) {
            this.right = node
            this.right.parent = this
        }
    }

    pop() {
        let output: TNode = null
        if (this.right) {
            output = this.right
            this.right = null
        } else if (this.left) {
            output = this.left
            this.left = null
        }
        if (output) {
            output.parent = null
        }
        return output
    }
}

export class UnaryExpression extends AstNode implements TUnaryExpression {

    public get type(): 'UnaryExpression' {
        return 'UnaryExpression'
    }
    public get closed() {
        return !!this.argument
    }

    public operator: TUnaryOperator
    public argument: TNode | null

    public constructor(parent: TAstNode, operator: TUnaryOperator, argument?: TNode) {
        super(parent)
        this.operator = operator
        this.argument = argument || null
    }


    appendNode(node: TNode) {
        if (!this.argument) {
            this.argument = node
            this.argument.parent = this
        }
    }

    pop() {
        let output: TNode = null
        if (this.argument) {
            output = this.argument
            this.argument = null
        }
        if (output) {
            output.parent = null
        }
        return output
    }
}

export class BracketRound extends AstNode implements TBracketRound {
    public get type(): 'BracketRound' {
        return 'BracketRound'
    }
    public nodes: TNode[]
    private _closed: boolean
    public constructor(parent: TAstNode) {
        super(parent)
        this.nodes = []
        this._closed = false
    }
    public get closed() {
        return this._closed
    }
    public appendNode(node: TNode) {
        if(node.type === 'BracketRound') {
            this._closed = true
        } else {
            this.nodes.push(node)
            node.parent = this
        }
    }
    public pop() {
        return this.nodes.pop()
    }
}

export class VariableDeclarator extends AstNode implements TVariableDeclarator {
    public get type(): 'VariableDeclarator' {
        return 'VariableDeclarator'
    }
    public id: TIdentifier
    public init: TValueNode
    public constructor(parent: TAstNode, id: TIdentifier | string, init?: TValueNode) {
        super(parent)
        if(typeof id === 'string') {
            this.id = new Identifier(this, id)
        } else {
            this.id = id
            this.id.parent = this
        }
        this.init = init || null
    }
    public get closed() {
        return !!this.init
    }
    appendNode(node: TValueNode) {
        this.init = node
    }
}

export class VariableDeclaration extends AstNode implements TVariableDeclaration {
    public get type(): 'VariableDeclaration' {
        return 'VariableDeclaration'
    }
    public readonly declarations: TVariableDeclarator[]
    private _closed: boolean
    public constructor(parent: TAstNode) {
        super(parent)
        this.declarations = []
        this._closed = false
    }
    public get closed() { return this._closed }

    public appendNode(node: TNode) {
        switch(node.type) {
            case 'Identifier': {
                const declaretor = new VariableDeclarator(this, node)
                this.declarations.push(declaretor)
                break
            }
        }
    }
}