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


export type TNodeMeta = {
    nodeType: TNodeType
    nodeName: string
}

export type TNodeBase = TNodeMeta & {
    setName(name: string): void
    remove(): void
}

export type TData = {
    data: string
}

export type TDataNode = TNodeMeta & TData

export type TNode = TNodeBase & {
    parentNode: TElement | null
    nextSibling: TNode | null
    previousSibling: TNode | null
}

export type TTextNode = TNode & TData
export type TComment = TNode & TData
export type TInstruction = TNode & TData

export type TAttribute = TNodeBase & {
    nodeValue: string | undefined
    parent: TAttributeList | null
    setValue(value: string): void
    segments: TNode[]
}

export type TAttributeList = {
    append(attr: TAttribute): void
    remove(attr: TAttribute): boolean
    getAttribute(name: string): string
    setAttribute(name: string, value: any): void
    removeAttribute(name: string): boolean
    some(fn: { (node: TAttribute): boolean }): boolean
    each(callback: { (attr: TAttribute): void }): void
    find(callback: { (attr: TAttribute): boolean }): TAttribute | null
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

    query(fn: { (node: TNodeBase): boolean }): TNodeBase | null
    queryAll(fn: { (node: TNodeBase): boolean }): TNodeBase[]
    each(fn: { (node: TNodeBase): void }): void
    some(fn: { (node: TNodeBase): boolean }): boolean
    traverse(operators: TTraverseOperator[] | { [key: string]: { (node: TTraverseNode): void } } | { (node: TTraverseNode): void }): void
}

export type TTraverseNode = TNodeBase
    | ({ nodeType: 1 } & TElement)
    | ({ nodeType: 2 } & TAttribute)
    | ({ nodeType: 3 } & TTextNode)
    | ({ nodeType: 7 } & TInstruction)
    | ({ nodeType: 8 } & TComment)
export type TTraverseTester = number | string | RegExp | [number, TTraverseTester?] | { (node: TTraverseNode): boolean }
export type TTraverseOperator = {
    test: TTraverseTester
    use(node: TTraverseNode): void
}