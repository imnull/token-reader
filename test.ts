import { xmlx }from './src'

let code = 
`
<ab== === ===>
    <!-- 123
    abc -->
    <abc>
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

console.log(doc + '')
console.log([doc.query(n => n.nodeName === 'abc') + ''])
console.log(doc.queryAll(n => n.nodeName === 'abc').map(n => n.toString()))
