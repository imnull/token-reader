import { jsonx } from './src'

let code = `callback(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]));`
// code = `(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]));;;;;`
// code = `  { 'a1   b': 1, _xyz: 3, 456 }  `
// code = `[1,2,3]`
// code = `  { 'a1   b': 1, _xyz: 3, arr: [3,4,5,,,,,89   ] }  `
// code = `  (1,[12,3,4],3,{xyz:123},[12,3,4,{a:[5,6,7,,,,8]},[5,6,7,,,,8]])  `
// code = `  abc  `
// code = `[{ a: 1, b: 2 },,2,,,,,[1,{x:1}],,,9]`
// code = `{ a: 1, aa: { aaa: 1 }, b: { bb: 2, bbb: 3, c: { cc: 22, ccc: { cccc: 3333 } }, d: 4 }, e: 5 }`
// code = `{ a: 1, aa: { aaa: 1 },,,,b:2,c: null,xyz }`
// code = `1,,1,2,,3,4,5,6,,2,3)`
// code = `1,,1,2,,3,4,5,6,,2,3`
// code = `callback(((1,2,3,5,6,7)))`
// code = `[1,(,,1,,1,2,,3,4,5,6,,2,3)]`
// code = `[,7,8,9,10,,,,100,]`
// code = `(,,,,,,1,,,,2,,,,,3,,)`


const obj = jsonx.parse(code)
console.log(111, obj)
console.log(111, JSON.stringify(obj))

