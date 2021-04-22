import { TElement, TNodeType, TAttributeList, TNode, TComment, TTextNode, TTraverseOperator, TNodeBase, TTraverseNode, TInstruction } from "./type";
import XAttributeList from './attribute-list';
import { traverseTest } from './utils'
import { arrayFind } from "../polyfill";

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
        return this.__nodeName
    }

    public parentNode: TElement
    public previousSibling: TNode
    public nextSibling: TNode

    private readonly __nodeType: TNodeType
    private __nodeName: string

    constructor(name: string, type: TNodeType) {

        this.__nodeName = name
        this.__nodeType = type

        this.parentNode = null
        this.previousSibling = null
        this.nextSibling = null
    }

    setName(name: string) {
        this.__nodeName = name
    }

    remove(): void {
        this.parentNode && this.parentNode.removeChild(this)
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

    getAttribute(name: string) {
        return this.attributes.getAttribute(name)
    }
    setAttribute(name: string, value: any) {
        this.attributes.setAttribute(name, value)
    }
    removeAttribute(name: string) {
        return this.attributes.removeAttribute(name)
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
    each(fn: { (node: TNodeBase): void }): void {
        let node = this.firstChild || null
        while(node) {
            fn(node)
            if(node instanceof XElement) {
                node.attributes.each(attr => {
                    fn(attr)
                    attr.segments.forEach(seg => {
                        fn(seg)
                    })
                })
                node.each(fn)
            }
            node = node.nextSibling
        }
    }
    some(fn: { (node: TNodeBase): boolean }): boolean {
        let node = this.firstChild || null
        while(node) {
            if(fn(node)) {
                return true
            }
            if(node instanceof XElement) {
                if(node.attributes.some(attr => {
                    if(fn(attr)) {
                        return true
                    }
                    return attr.segments.some(fn)
                })) {
                    return true
                }
                if(node.some(fn)) {
                    return true
                }
            }
            node = node.nextSibling
        }
        return false
    }
    query(fn: { (node: TNodeBase): boolean }): TNodeBase | null {
        let node: TNodeBase | null = null
        return this.some(n => fn(node = n)) ? node : null
    }
    queryAll(fn: { (node: TNodeBase): boolean }): TNodeBase[] {
        const arr: TNodeBase[] = []
        this.each(node => {
            fn(node) && arr.push(node)
        })
        return arr
    }
    append(node: TNode): void {
        this.appendChild(node)
    }
    
    appendTo(node: TElement): void {
        node.appendChild(this)
    }

    traverse(operators: TTraverseOperator[] | { [key: string]: { (node: TTraverseNode): void } } | { (node: TTraverseNode): void }) {
        let ops: TTraverseOperator[]

        // format operators
        if(typeof operators === 'function') {
            ops = [{ test: () => true, use: operators }]
        } else if(!Array.isArray(operators)) {
            ops = Object.keys(operators).map(key => {
                try {
                    return { test: new RegExp(key), use: operators[key] }
                } catch(ex) {
                    return { test: key, use: operators[key] }
                }
            })
        } else {
            ops = operators
        }

        // create invoker
        const invoke = (node: TNodeBase) => {
            const op = arrayFind(ops, ({ test }) => traverseTest(node, test))
            op && op.use(node)
        }

        this.each(invoke)
    }

    toString() {
        if(this.isSingle) {
            return `<${this.nodeName}${this.attributes} />`
        } else {
            const closure = this.isClosed ? `</${this.nodeName}>` : `</${this.nodeName}>`
            return `<${this.nodeName}${this.attributes}>${this.childNodes.map(n => n.toString()).join('')}${closure}`
        }
    }
}

export class XTextNode extends XDataNode implements TTextNode {
    constructor(data: string = '') {
        super(data, '#text', 3)
    }
}

export class XComment extends XDataNode implements TComment {
    constructor(data: string = '') {
        super(data, '#comment', 8)
    }
    toString() {
        return `<!--${super.toString()}-->`
    }
}

export class XInstruction extends XDataNode implements TInstruction {
    constructor(data: string = '') {
        super(data, '#instruction', 7)
    }
    toString() {
        return `{{${super.toString()}}}`
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

    public createInstruction(data: string) {
        return new XInstruction(data)
    }

    toString() {
        return this.childNodes.map(node => node.toString()).join('')
    }
}