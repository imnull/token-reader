import { TElement, TNodeType, TAttributeList, TNode } from "./type";
import XAttributeList from './attribute-list';

const rebuildChain = (node: TNode) => {
    if(node.previousSibling) {
        node.previousSibling.nextSibling = node
    }
    if(node.nextSibling) {
        node.nextSibling.previousSibling = node
    }
}

class XNode implements TNode {

    public get nodeType(): TNodeType {
        return this.__nodeType
    }

    public get nodeName(): string {
        return this._nodeName
    }

    public parentNode: TElement
    public previousSibling: TNode
    public nextSibling: TNode

    private readonly __nodeType: TNodeType
    protected _nodeName: string

    constructor(name: string, type: TNodeType) {

        this._nodeName = name
        this.__nodeType = type

        this.parentNode = null
        this.previousSibling = null
        this.nextSibling = null
    }
}

class XDataNode extends XNode implements TNode {

    public data: string

    constructor(data: string = '', name: string, type: TNodeType) {
        super(name, type)
        this.data = data
    }

    toString() {
        return this.data
    }
}

export class XElement extends XNode implements TElement {

    public get nodeType(): TNodeType {
        return 1
    }

    public isSingle: boolean
    public isClosed: boolean

    public readonly attributes: TAttributeList
    public readonly childNodes: TNode[]

    public get firstChild() {
        if(this.childNodes.length > 0) {
            return this.childNodes[0]
        }
        return null
    }

    public get lastChild() {
        if(this.childNodes.length > 0) {
            return this.childNodes[this.childNodes.length - 1]
        }
        return null
    }

    constructor(name: string = '') {
        super(name, 1)
        this.isSingle = false
        this.isClosed = false
        this.attributes = new XAttributeList()
        this.childNodes = []
    }

    setNodeName(name: string) {
        return this._nodeName = name
    }

    getAttribute(name: string) {
        return this.attributes.getAttribute(name)
    }
    setAttribute(name: string, value: any) {
        this.attributes.setAttribute(name, value)
    }
    removeAttribute(name: string) {
        return this.attributes.removeAttribute(name)
    }

    toString() {
        if(this.isSingle) {
            return `<${this.nodeName}${this.attributes}/>`
        } else {
            const closure = this.isClosed ? `</${this.nodeName}>` : `</${this.nodeName}>`
            return `<${this.nodeName}${this.attributes}>${this.childNodes.map(n => n.toString()).join('')}${closure}`
        }
    }

    removeChild(node: TNode) {
        const idx = this.childNodes.indexOf(node)
        if(idx < 0) {
            const err = new Error(`Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`)
            err.name = `DOMException`
            throw err
        }
        this.childNodes.splice(idx, 1)
        if(node.previousSibling) {
            node.previousSibling.nextSibling = node.nextSibling
        }
        if(node.nextSibling) {
            node.nextSibling.previousSibling = node.previousSibling
        }
        node.parentNode = null
        node.previousSibling = null
        node.nextSibling = null
        return node
    }

    appendChild(node: TNode): TNode {
        node.parentNode && node.parentNode.removeChild(node)

        node.parentNode = this
        node.previousSibling = this.lastChild
        node.nextSibling = null
        rebuildChain(node)

        this.childNodes.push(node)
        return node
    }

    insertBefore(newNode: TNode, childNode: TNode): TNode {
        const idx = this.childNodes.indexOf(childNode)
        if(idx < 0) {
            const err = new Error(`Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.`)
            err.name = `DOMException`
            throw err
        }
        newNode.parentNode && newNode.parentNode.removeChild(newNode)

        newNode.parentNode = this
        newNode.previousSibling = childNode.previousSibling
        newNode.nextSibling = childNode
        rebuildChain(newNode)

        this.childNodes.splice(idx, 0, newNode)
        return newNode
    }

    query(fn: { (node: TNode): boolean }): TNode | null {
        let node = this.firstChild || null
        while(node) {
            if(fn(node)) {
                return node
            }
            if(node instanceof XElement) {
                const sub = node.query(fn)
                if(sub) {
                    return sub
                }
            }
            node = node.nextSibling
        }
        return node
    }

    queryAll(fn: { (node: TNode): boolean }): TNode[] {
        const arr: TNode[] = []
        let node = this.firstChild || null
        while(node) {
            if(fn(node)) {
                arr.push(node)
            }
            if(node instanceof XElement) {
                arr.push(...node.queryAll(fn))
            }
            node = node.nextSibling
        }
        return arr
    }
}

export class XTextNode extends XDataNode implements TNode {
    constructor(data: string = '') {
        super(data, '#text', 3)
    }
}

export class XComment extends XDataNode implements TNode {
    constructor(data: string = '') {
        super(data, '#comment', 8)
    }
    toString() {
        return `<!--${super.toString()}-->`
    }
}

export class XDocument extends XElement {
    public get nodeType(): TNodeType {
        return 9
    }
    public get nodeName(): string {
        return '#document'
    }

    public createElement(name: string) {
        return new XElement(name)
    }

    public createTextNode(data: string) {
        return new XTextNode(data)
    }

    public createCommen(data: string) {
        return new XComment(data)
    }

    toString() {
        return this.childNodes.map(node => node.toString()).join('')
    }
}