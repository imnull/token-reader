import { XDocument } from '../xdom/index'
import { TElement } from '../xdom/type'
import { read } from './readers'
import { TXmlTokenType } from './type'
import { TTokenLite } from '../type'

export const parse = (content: string) => {

    const doc = new XDocument()

    let cursor: TElement = doc
    let attr: TTokenLite<TXmlTokenType> = null

    read(content, node => {
        switch (node.type) {
            case 'element':
                const el = doc.createElement(node.value)
                cursor.appendChild(el)
                cursor = el
                break
            case 'element-close':
                let n = cursor
                while (n) {
                    if (n.nodeName === node.value) {
                        break
                    }
                    n = n.parentNode
                }
                if (n) {
                    n.isClosed = true
                    cursor = n.parentNode || doc
                }
                break
            case 'attribute-name':
                attr = node
                cursor.attributes.setAttribute(node.value, null)
                break
            case 'attribute-value':
                cursor.attributes.setAttribute(attr.value, node.value)
                break
            case 'element-blank':
                cursor.attributes.appendBlank(node.value)
                break
            case 'element-single':
                cursor.isSingle = true
                cursor.attributes.trimEnd()
                cursor = cursor.parentNode || doc
                break
            case 'element-end':
                cursor.isSingle = false
                cursor.attributes.trimEnd()
                break
            case 'text':
                cursor.appendChild(doc.createTextNode(node.value))
                break
            case 'comment':
                cursor.appendChild(doc.createCommen(node.value))
                break
            case 'instruction':
                cursor.appendChild(doc.createInstruction(node.value))
                break
        }
    })

    return doc
}