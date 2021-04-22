import { TAttribute, TNodeType, TAttributeList, TDataNode, TTextNode, TElement, TNode, TInstruction } from './type'
import { quotify, QUOTES, splitBinder } from './utils';

class XSegmentText implements TTextNode {
    setName(_name: string): void { }
    remove(): void { }
    public get parentNode(): TElement { return null }
    public get nextSibling(): TNode { return null }
    public get previousSibling(): TNode { return null }
    public get nodeName() {
        return '#text'
    }
    public get nodeType() {
        return 3 as TNodeType
    }

    public readonly data: string
    constructor(data: string) {
        this.data = data
    }

    toString() { return this.data }
}
class XSegmentBinder implements TInstruction {
    setName(_name: string): void { }
    remove(): void { }
    public get parentNode(): TElement { return null }
    public get nextSibling(): TNode { return null }
    public get previousSibling(): TNode { return null }

    public get nodeName() {
        return '#instruction'
    }
    public get nodeType() {
        return 7 as TNodeType
    }

    public readonly data: string
    constructor(data: string) {
        this.data = data
    }

    toString() { return `{{${this.data}}}` }
}

export class XAttribute implements TAttribute {

    public nodeName: string
    public get nodeValue() {
        return this.segments.map(seg => seg.toString()).join('')
    }

    private rawValue: string
    private quote: string
    private hasSetValue: boolean

    public parent: TAttributeList
    public segments: TNode[]

    constructor(name: string, value: any, parent: TAttributeList) {
        this.parent = parent
        this.hasSetValue = false
        this.segments = []
        this.setName(name)
        this.setValue(value)
    }

    get nodeType(): TNodeType {
        return 2
    }

    setSegments() {
        if(!this.rawValue) {
            this.segments = []
        } else {
            const segs = splitBinder(this.rawValue)
            this.segments = segs.map(({ type, data }) => {
                if(type === 'text') {
                    return new XSegmentText(data)
                } else {
                    return new XSegmentBinder(data)
                }
            })
        }
    }

    setValue(value: any) {
        if(value === null || typeof value === 'undefined') {
            return
        }
        this.hasSetValue = true
        if(typeof value !== 'string') {
            value = JSON.stringify(value)
        }
        const q = quotify(value, QUOTES)
        this.rawValue = q.value
        this.quote = q.quote

        this.setSegments()
    }

    getValue() {
        if(this.rawValue === 'undefined') {
            return true
        }
        return this.rawValue
    }

    setName(name: string) {
        this.nodeName = name
    }

    toString() {
        if(!this.hasSetValue) {
            return this.nodeName
        }
        return `${this.nodeName}=${this.quote}${this.nodeValue}${this.quote}`
    }
    remove() {
        this.parent && this.parent.remove(this)
    }
}

export class XAttributeBlank implements TAttribute {
    public nodeName: string
    public nodeValue: string
    public parent: TAttributeList
    public segments: TNode[]

    get nodeType(): TNodeType {
        return 0
    }

    setName(name: string) {
        this.nodeName = name
    }
    setValue(value: string) {
        this.nodeValue = value
    }

    constructor(s: string, parent: TAttributeList) {
        this.parent = parent
        this.segments = []
        this.setValue(s)
    }

    toString() {
        return this.nodeValue
    }

    remove() {
        this.parent && this.parent.remove(this)
    }
}