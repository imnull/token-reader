export type TBranchNode<T> = {

    value: T | null

    parent: TBranchNode<T> | null

    previous: TBranchNode<T> | null
    next: TBranchNode<T> | null

    first: TBranchNode<T> | null
    last: TBranchNode<T> | null

    has(node: TBranchNode<T>): boolean
    append(node: TBranchNode<T>): TBranchNode<T>
    remove(node: TBranchNode<T>): void
    appendToken(token: T): TBranchNode<T>
}

export class BranchNode<T> implements TBranchNode<T> {

    public value: T
    public parent: TBranchNode<T> | null
    public previous: TBranchNode<T> | null
    public next: TBranchNode<T> | null
    public first: TBranchNode<T> | null
    public last: TBranchNode<T> | null

    public constructor(value: T | null, parent: TBranchNode<T> | null = null) {
        this.value = value
        this.parent = parent
        this.previous = null
        this.next = null
    }

    public has(node: TBranchNode<T>) {
        return node.parent === this
    }

    public remove(node: TBranchNode<T>) {
        if(!this.has(node)) {
            return
        }
        if(this.first === node) {
            this.first = node.next
        }
        if(this.last === node) {
            this.last = node.previous
        }
        if(node.previous) {
            node.previous.next = node.next
        }
        if(node.next) {
            node.next.previous = node.previous
        }
        node.parent = null
        node.next = null
        node.previous = null
    }

    public append(node: TBranchNode<T>) {
        if(node.parent) {
            node.parent.remove(node)
        }
        node.parent = this
        if(!this.first) {
            this.first = node
            this.last = node
            node.previous = node.next = null
        } else {
            this.last.next = node
            node.previous = this.last
            node.next = null
            this.last = node
        }
        return node
    }

    public appendToken(token: T): TBranchNode<T> {
        return this.append(new BranchNode(token, this))
    }
}

export const traverse = <T>(ast: BranchNode<T>, cb: { (node: BranchNode<T>): void }) => {
    if(!ast) {
        return
    }
    let n = ast
    while(n) {
        n.value && cb(n)
        traverse(n.first, cb)
        n = n.next
    }
}


export type TAstNodeType = 'NumberLiteral' | 'StringLiteral' | 'Identifier'
export type TAstNode = {
    type: TAstNodeType
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
