import { xmlx, jsonx, xcript } from './src'
import { readMiniBinder } from './src/utils'
import { REG_DATE } from './src/readers'


// let code =
// `
// <ab== =="123{{abc}}xyz">
//     <!-- 123
//     abc -->
//     <!-->
//     123{{
//         "{{xyz}}"
//     }}456
//     <abc xyz /  >
//     <abc><abc>123</abc>
// </ab>
// `

// const doc = xmlx.parse(code)

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

// doc.traverse(node => {
//     if(node.nodeType === 7) {
//         console.log(node.toString())
//     }
// })

// console.log(doc + '')
// console.log([doc.query(n => n.nodeName === 'abc') + ''])
// console.log(doc.queryAll(n => n.nodeName === 'abc').map(n => n.toString()))

// console.log(readMiniBinder('123{{`${"{{fdsafs}}"}`}}456', 3))

// console.log(jsonx.parse(`2021-04-22T02:37:47Z`))

// xcript.read(`var x = 1`, node => {
//     console.log([1, node.type, node.value])
// })

// jsonx.read(`   callback(((1,2,3,5,6,7)));  `, node => {
//     console.log(2, node.type, node.value)
// })

xcript.parse(`null`)
xcript.parse(`undefined`)
xcript.parse(`1`)
xcript.parse(`'abc'`)

// xcript.parse(`2 + 3`)
// xcript.parse(`2 - 3`)
// xcript.parse(`2 * 3`)
// xcript.parse(`2 / 3`)
// xcript.parse(`2 % 3`)
// xcript.parse(`2 & 3`)
// xcript.parse(`2 | 3`)
// xcript.parse(`2 ^ 3`)
// xcript.parse(`2 > 3`)
// xcript.parse(`2 >= 3`)
// xcript.parse(`2 < 3`)
// xcript.parse(`2 <= 3`)
// xcript.parse(`2 == 3`)
// xcript.parse(`2 != 3`)
// xcript.parse(`2 === 3`)
// xcript.parse(`2 !== 3`)
// xcript.parse(`2 >> 1`)
// xcript.parse(`2 >>> 1`)
// xcript.parse(`2 << 1`)

// xcript.parse(`true && true`)
// xcript.parse(`true && false`)
// xcript.parse(`false && true`)
// xcript.parse(`false && false`)
// xcript.parse(`true || true`)
// xcript.parse(`true || false`)
// xcript.parse(`false || true`)
// xcript.parse(`false || false`)
// xcript.parse(`true && true && false`)
// xcript.parse(`true && true && true`)
// xcript.parse(`false || false || true`)

// xcript.parse(`2 + + 3`)
// xcript.parse(`2 + -3`)
// xcript.parse(`2 - +3`)
// xcript.parse(`2 - - 3`)
// xcript.parse(`- 3`)
// xcript.parse(`+ 3`)

// xcript.parse(`typeof 0+100`)
// xcript.parse(`typeof '0'+100`)
// xcript.parse(`void(0)`)
// xcript.parse(`typeof (0+100)`)
// xcript.parse(`typeof null`)
// xcript.parse(`typeof undefined`)
// xcript.parse(`typeof {}`)
// xcript.parse(`typeof ({})`)
// xcript.parse(`typeof void 0`)
// xcript.parse(`typeof + {}`)

// xcript.parse(`{ a: 1 + 2, b: true ^ 11, c: 'ccc-' + 100, d: 1 && 2, 'eeee': 1 || 2 }`)

// xcript.parse(`var x`)
// xcript.parse(`var x =`)
// xcript.parse(`var x =1`)
// xcript.parse(`var x ={}`)
// xcript.parse(`var x =[{a: 1}, 2,3,4]`)

// xcript.parse(`var x  = 1, y = x`)


// xcript.parse(`var x=5,y,z=1;x;y;z`)
// xcript.parse(`var a \n,\nb\na`)