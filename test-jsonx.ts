import { jsonx } from './src'

let code = `callback(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]))`

const tail = jsonx.read(code)
if(tail) {
    jsonx.traverse(tail, node => {
        console.log(node.depth, node.type, node.value)
    })
}

console.log(jsonx.parse(code))
