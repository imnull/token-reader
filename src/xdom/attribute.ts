import { TAttribute, TNodeType, TAttributeList } from './type'
import { quotify, QUOTES } from './utils';

export class XAttribute implements TAttribute {

    public name: string
    public value: string
    private quote: string

    public parent: TAttributeList

    constructor(name: string, value: any, parent: TAttributeList) {
        this.parent = parent
        this.setName(name)
        this.setValue(value)
    }

    get nodeName(): string {
        return this.name || ''
    }

    get nodeType(): TNodeType {
        return 2
    }

    setValue(value: any) {
        if(value === false || value === null || (typeof value === 'number' && isNaN(value))) {
            this.value = ''
            this.quote = '"'
        } else if(value === true || typeof value === 'undefined') {
            this.value = void(0)
        } else {
            if(typeof value !== 'string') {
                value = JSON.stringify(value)
            }
            const q = quotify(value, QUOTES)
            this.value = q.value
            this.quote = q.quote
        }
    }

    getValue() {
        if(this.value === 'undefined') {
            return true
        }
        return this.value
    }

    setName(name: string) {
        this.name = name
    }

    toString() {
        let val = typeof this.value === 'undefined' || this.value === null ? '' : (this.value + '')
        if(!val) {
            return this.name
        }
        return `${this.name}=${this.quote}${val}${this.quote}`
    }
    remove() {
        this.parent && this.parent.remove(this)
    }
}

export class XAttributeBlank implements TAttribute {
    public name: string
    public value: string
    public parent: TAttributeList

    get nodeName(): string {
        return ''
    }

    get nodeType(): TNodeType {
        return 0
    }

    setName(name: string) {
        this.name = name
    }
    setValue(value: string) {
        this.value = value
    }

    constructor(s: string, parent: TAttributeList) {
        this.parent = parent
        this.setValue(s)
    }

    toString() {
        return this.value
    }

    remove() {
        this.parent && this.parent.remove(this)
    }
}