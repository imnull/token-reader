export class ScopeItem {
    public readonly name: string
    private readonly parent: Scope
    constructor(name: string, parent: Scope) {
        this.name = name
        this.parent = parent
    }

    getValue() {
        return this.parent.getValue(this.name)
    }
    setValue(val: any) {
        return this.parent.setValue(this.name, val)
    }
}
export class Scope {
    private readonly scope: { [key: string]: { status: 0 | 1, value: any, kind: string } }

    constructor() {
        this.scope = {}
    }

    private getValueItem(name: string): { status: 0 | 1, value: any } {
        const item = this.scope[name]
        if(!item) {
            const err = new Error(`${name} is not defined`)
            err.name = 'ReferenceError'
            throw err
        }
        return item
    }

    getValue(name: string) {
        const item = this.getValueItem(name)
        return item.status === 1 ? item.value : void(0)
    }

    setValue(name: string, value: any) {
        const item = this.getValueItem(name)
        item.status = 1
        item.value = value
    }

    extract(name: string) {
        return new ScopeItem(name, this)
    }

    declare(name: string, kind: string) {
        this.scope[name] = {
            kind,
            status: 0,
            value: void(0)
        }
        return this.extract(name)
    }

}