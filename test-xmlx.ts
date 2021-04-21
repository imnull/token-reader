import { xmlx } from './src'
import { readMiniBinder } from './src/utils'

let code =
`
<ab== =="123{{abc}}xyz">
    <!-- 123
    abc -->
    <!-->
    123{{
        "{{xyz}}"
    }}456
    <abc xyz /  >
    <abc><abc>123</abc>
</ab>
`

const doc = xmlx.parse(code)

// doc.traverse([
//     {
//         test: () => true,
//         use: node => {
//             if(node.nodeType === 2) {
//                 node.setName('!' + node.nodeName)
//             }
//         }
//     }
// ])

// doc.traverse({
//     'ab.*': node => {
//         node.setName(node.nodeName.split('').reverse().join(''))
//     }
// })

doc.traverse(node => {
    if(node.nodeType === 7) {
        console.log(node.toString())
    }
})

console.log(doc + '')
console.log([doc.query(n => n.nodeName === 'abc') + ''])
console.log(doc.queryAll(n => n.nodeName === 'abc').map(n => n.toString()))

console.log(readMiniBinder('123{{`${"{{fdsafs}}"}`}}456', 3))
