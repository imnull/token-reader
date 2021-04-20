import { xmlx }from './src'

let code = 
`
<ab== === ===>
    <!-- 123
    abc -->
    <abc><abc>123</abc>
</ab>
`

const doc = xmlx.parse(code)

console.log(doc + '')
console.log(doc.queryAll(n => n.nodeName === 'abc').map(n => n.toString()))
