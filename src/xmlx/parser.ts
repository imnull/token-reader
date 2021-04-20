import { XDocument, XAttribute, XAttributeBlank } from './dom'
import { TElement } from './dom/type'
import { read } from './readers'
import createTraverse from '../traverse'
import { TXmlTokenType } from './type'

export const traverse = createTraverse<TXmlTokenType>()

export const parse = (content: string) => {
    const tail = read(content)

    const doc = new XDocument()

    let cur: TElement = doc

    traverse(tail, node => {
        switch (node.type) {
            case 'element':
                const el = doc.createElement(node.value)
                cur.appendChild(el)
                cur = el
                break
            case 'element-close':
                let n = cur
                while (n) {
                    if (n.nodeName === node.value) {
                        break
                    }
                    n = n.parentNode
                }
                if (n) {
                    n.isClosed = true
                    cur = n.parentNode || doc
                }
                break
            case 'attribute-name':
                cur.attributes.setAttribute(node.value, '')
                break
            case 'attribute-value':
                const nameNode = node.previous.previous
                cur.attributes.setAttribute(nameNode.value, node.value)
                break
            case 'blank':
                cur.attributes.append(new XAttributeBlank(node.value))
                break
            case 'element-single':
                if (node.next && node.next.type === 'element-end') {
                    cur.isSingle = true
                }
                break
            case 'element-end':
                cur.attributes.trimEnd()
                break
            case 'plain':
                cur.appendChild(doc.createTextNode(node.value))
                break
            case 'element-comment':
                cur.appendChild(doc.createCommen(node.value))
                break
        }
    })

    return doc
}