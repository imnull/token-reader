import { read, traverse, parse }from './src/jsonx'

let code = `callback(({a:1,  b: [{ccc:'ccc'}] }))`

const tail = read(code)
if(tail) {
    traverse(tail, node => {
        console.log(node.depth, node.type, node.value)
    })
}

console.log(parse(code))
