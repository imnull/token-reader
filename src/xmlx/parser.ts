import { XDocument } from '../xdom/index'
import { TElement } from '../xdom/type'
import { read } from './readers'
import { TXmlTokenType } from './type'
import { TToken, TParser, TReaderCallbackFactory } from '../type'

export const createReaderCallback: TReaderCallbackFactory<XDocument, TXmlTokenType> = stack => {

    let cursor: TElement = stack
    let attr: TToken<TXmlTokenType> = null

    return node => {
        switch (node.type) {
            case 'element':
                const el = stack.createElement(node.value)
                cursor.appendChild(el)
                cursor = el
                return true
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
                    cursor = n.parentNode || stack
                }
                return true
            case 'attribute-name':
                attr = node
                cursor.attributes.setAttribute(node.value, null)
                return true
            case 'attribute-value':
                cursor.attributes.setAttribute(attr.value, node.value)
                return true
            case 'element-blank':
                cursor.attributes.appendBlank(node.value)
                return true
            case 'element-single':
                cursor.isSingle = true
                cursor.attributes.trimEnd()
                cursor = cursor.parentNode || stack
                return true
            case 'element-end':
                cursor.isSingle = false
                cursor.attributes.trimEnd()
                return true
            case 'text':
                cursor.appendChild(stack.createTextNode(node.value))
                return true
            case 'comment':
                cursor.appendChild(stack.createCommen(node.value))
                return true
            case 'instruction':
                cursor.appendChild(stack.createInstruction(node.value))
                return true
        }
        return false
    }
}

export const parse: TParser = (content, start = 0) => {
    const doc = new XDocument()
    const callback = createReaderCallback(doc)
    read(content, callback, start)
    return doc
}