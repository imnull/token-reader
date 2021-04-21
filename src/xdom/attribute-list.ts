import { TAttribute, TAttributeList } from "./type";
import { XAttributeBlank, XAttribute } from "./attribute";

export default class XAttributeList implements TAttributeList {

    private readonly __attrs: TAttribute[]

    constructor() {
        this.__attrs = []
    }
    
    append(attr: TAttribute) {
        const last = this.getLastAttribute()
        if((!last || last.nodeType !== 0) && attr.nodeType === 2) {
            this.__attrs.push(new XAttributeBlank(' ', this))
        }
        attr.remove()
        attr.parent = this
        this.__attrs.push(attr)
    }

    remove(attr: TAttribute) {
        const idx = this.__attrs.indexOf(attr)
        if(idx < 0) {
            return false
        }
        const blankIndex = idx - 1
        if(blankIndex > -1 && this.__attrs[blankIndex].nodeType !== 2) {
            this.__attrs.splice(blankIndex, 2)
        } else {
            this.__attrs.splice(idx, 1)
        }
        return true
    }

    getLastAttribute() {
        if(this.__attrs.length < 1) {
            return null
        }
        return this.__attrs[this.__attrs.length - 1]
    }
    
    findAttribute(callback: { (attr: TAttribute, index: number, array: TAttribute[]): boolean }) {
        return this.__attrs.filter(attr => attr.nodeType === 2).find(callback)
    }

    findAttributeByName(name: string) {
        return this.findAttribute(attr => attr.name === name)
    }
    
    getAttribute(name: string) {
        const attr = this.findAttributeByName(name)
        return attr ? attr.value : null
    }

    setAttribute(name: string, value: any) {
        const attr = this.findAttributeByName(name)
        if(!attr) {
            this.append(new XAttribute(name, value, this))
        } else {
            attr.setValue(value)
        }
    }

    appendBlank(blank: string) {
        this.append(new XAttributeBlank(blank, this))
    }

    removeAttribute(name: string) {
        const attr = this.findAttributeByName(name)
        if(!attr) {
            return false
        }
        return this.remove(attr)
    }

    forEach(callback: { (attr: TAttribute, index: number, array: TAttribute[]): void }) {
        return this.__attrs.filter(attr => attr.nodeType === 2).forEach(callback)
    }

    map<T>(callback: { (attr: TAttribute, index: number, array: TAttribute[]): T }) {
        return this.__attrs.filter(attr => attr.nodeType === 2).map<T>(callback)
    }
    trimEnd() {
        let attr = this.getLastAttribute()
        while(attr && attr.nodeType === 0) {
            this.__attrs.pop()
            attr = this.getLastAttribute()
        }
    }

    toString() {
        return this.__attrs.map(attr => attr.toString()).join('')
    }
}