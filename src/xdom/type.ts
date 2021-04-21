export type TQuote = '"' | "'"

export type TNodeType =
    0   // blank
    | 1   // Element
    | 2 // Attr
    | 3 // Text
    | 4 // CDATASection
    | 5 // Entity 实体引用
    | 6 // Entity 一个实体
    | 7 // ProcessingInstruction 一个处理指令
    | 8 // Comment
    | 9 // Document
    | 10 // DocumentType 为文档实体提供接口
    | 11 // DocumentFragment
    | 12 // Notation 代表一个符号在DTD中的声明

export type TNodeBase = {
    nodeType: TNodeType
    nodeName: string
    setName(name: string): void
    remove(): void
}

export type TNode = TNodeBase & {
    parentNode: TElement | null
    nextSibling: TNode | null
    previousSibling: TNode | null
}

export type TTextNode = TNode & {
    data: string
}

export type TComment = TNode & {
    data: string
}

export type TAttribute = TNodeBase & {
    name: string | undefined
    value: string | undefined
    parent: TAttributeList | null
    setValue(value: string): void
}

export type TAttributeList = {
    append(attr: TAttribute): void
    remove(attr: TAttribute): boolean
    getAttribute(name: string): string
    setAttribute(name: string, value: any): void
    removeAttribute(name: string): boolean
    forEach(callback: { (attr: TAttribute, index: number, array: TAttribute[]): void }): void
    trimEnd(): void
    appendBlank(blank: string): void
}

export type TElement = TNode & {
    attributes: TAttributeList
    childNodes: TNode[]
    isSingle: boolean
    isClosed: boolean

    firstChild: TNode | null
    lastChild: TNode | null

    getAttribute(name: string): string
    setAttribute(name: string, value: any): void
    removeAttribute(name: string): boolean

    removeChild(node: TNode): TNode
    appendChild(node: TNode): TNode
    insertBefore(newNode: TNode, childNode: TNode): TNode

    append(node: TNode): void
    appendTo(node: TElement): void

    query(fn: { (node: TNode): boolean }): TNode | null
    queryAll(fn: { (node: TNode): boolean }): TNode[]
    each(fn: { (node: TNode): void }): void
    some(fn: { (node: TNode): any }): boolean
    traverse(operators: TTraverseOperator[]): void
}

export type TTraverseNode = TNodeBase | ({ nodeType: 2 } & TAttribute) | ({ nodeType: 3 } & TTextNode) | ({ nodeType: 8 } & TComment) | ({ nodeType: 1 } & TElement)
export type TTraverseTester = number | string | RegExp | [number, TTraverseTester?] | { (node: TTraverseNode): boolean }
export type TTraverseOperator = {
    test: TTraverseTester
    use(node: TTraverseNode): void
}