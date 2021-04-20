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
}

export type TNode = TNodeBase & {
    parentNode: TElement | null
    nextSibling: TNode | null
    previousSibling: TNode | null
}
export type TAttribute = TNodeBase & {
    name: string | undefined
    value: string | undefined
    setName(name: string): void
    setValue(value: string): void
}

export type TAttributeList = {
    append(attr: TAttribute): void
    getAttribute(name: string): string
    setAttribute(name: string, value: any): void
    removeAttribute(name: string): boolean
    forEach(callback: { (attr: TAttribute, index: number, array: TAttribute[]): void }): void
    trimEnd(): void
}

export type TElement = TNode & {
    attributes: TAttributeList
    childNodes: TNode[]
    isSingle: boolean
    isClosed: boolean

    firstChild: TNode | null
    lastChild: TNode | null

    setNodeName(name: string): string

    getAttribute(name: string): string
    setAttribute(name: string, value: any): void
    removeAttribute(name: string): boolean

    removeChild(node: TNode): TNode
    appendChild(node: TNode): TNode
    insertBefore(newNode: TNode, childNode: TNode): TNode

    query(fn: { (node: TNode): boolean }): TNode | null
    queryAll(fn: { (node: TNode): boolean }): TNode[]
}