const { jsonx } = require('../dist')

test('[jsonx] 基础类型解析', () => {
    expect(jsonx.parse(`"abc"`)).toEqual('abc')
    expect(jsonx.parse(`'abc'`)).toEqual('abc')
    expect(jsonx.parse(`abc`)).toEqual('abc')
    expect(jsonx.parse(`123`)).toEqual(123)
    expect(jsonx.parse(`undefined`)).toEqual(undefined)
    expect(jsonx.parse(`null`)).toEqual(null)
    expect(jsonx.parse(`2021-04-22T02:37:47.123Z`).getTime()).toEqual(1619059067123)
    expect(jsonx.parse(`2021-04-22T02:37:47.123`).getTime()).toEqual(1619030267123)
    expect(jsonx.parse(`2021-04-22T02:37:47Z`).getTime()).toEqual(1619059067000)
    expect(jsonx.parse(`2021-04-22T02:37:47`).getTime()).toEqual(1619030267000)
    expect(jsonx.parse(`2021-04-22T02:37Z`).getTime()).toEqual(1619059020000)
    expect(jsonx.parse(`2021-04-22T02:37`).getTime()).toEqual(1619030220000)
    expect(jsonx.parse(`2021-04T02:37Z`).getTime()).toEqual(1617244620000)
    expect(jsonx.parse(`2021-04T02:37`).getTime()).toEqual(1617215820000)
    expect(jsonx.parse(`2021T02:37Z`).getTime()).toEqual(1609468620000)
    expect(jsonx.parse(`2021T02:37`).getTime()).toEqual(1609439820000)
})


test('[jsonx] 括号解析取值', () => {
    expect(jsonx.parse(`(,,,,,,1,,,,2,,,,,3,,)`)).toEqual(3)
    expect(jsonx.parse(`1,,1,2,,3,4,5,6,,2,3,9`)).toEqual(9)
    expect(jsonx.parse(`1,,1,2,,3,4,5,6,,2,3,9,8,,,,))))`)).toEqual(8)
    expect(jsonx.parse(`[1,(,,1,,1,2,,3,4,5,6,,2,3,,)]`)).toEqual([1, 3])
    expect(jsonx.parse(`{ a: ((1,2,3,,,,)), b: ({ bb: ([('abc'),2,3]) }) }`)).toEqual({ a: 3, b: { bb: ['abc', 2, 3] } })
    expect(jsonx.parse(`  (1,[12,3,4],3,{xyz:123},[12,3,4,{a:[5,6,7,,,,8]},[5,6,7,,,,8]])  `)).toEqual([
        12, 3, 4, { a: [5, 6, 7, , , , 8] }, [5, 6, 7, , , , 8]
    ])
    expect(jsonx.parse(`    (([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6])) ; ;;    ;;   `)).toEqual([{ a: 1, b: [{ ccc: 'ccc' }] }, '2', 3, , , 6])
})

test('[jsonx] 数组解析取值', () => {
    expect(jsonx.parse(`[1,2,3]`)).toEqual([1, 2, 3])
    expect(jsonx.parse(`[1,    2,  3,,,,,]`)).toEqual([1, 2, 3])
    expect(jsonx.parse(`[,7,8,9,10,,,,100,,]`)).toEqual([, 7, 8, 9, 10, , , , 100])
    expect(jsonx.parse(`[{ a: 1, b: 2 },,2,,,,,[1,{x:1}],,,9]`)).toEqual([{ a: 1, b: 2 }, , 2, , , , , [1, { x: 1 }], , , 9])
})

test('[jsonx] 对象解析取值', () => {
    expect(jsonx.parse(`{ a: 1, aa: { aaa: [1,[2,[{aaaa:[3]}]]] },,,,b:2,c: null,xyz }`)).toEqual({
        a: 1, aa: { aaa: [1, [2, [{ aaaa: [3] }]]] }, b: 2, c: null, xyz: 'xyz'
    })
    expect(jsonx.parse(`{ a: 1, aa: { aaa: 1 }, b: { bb: 2, bbb: 3, c: { cc: 22, ccc: { cccc: 3333 } }, d: 4 }, e: 5 }`)).toEqual({
        a: 1, aa: { aaa: 1 }, b: { bb: 2, bbb: 3, c: { cc: 22, ccc: { cccc: 3333 } }, d: 4 }, e: 5
    })
    expect(jsonx.parse(`  { 'a1   b': 1, _xyz: 3, arr: [3,4,5,,,,,89   ] }  `)).toEqual({ 'a1   b': 1, _xyz: 3, arr: [3, 4, 5, , , , , 89] })
    expect(jsonx.parse(`  { 'a1   b': 1, _xyz: 3, 456 }`)).toEqual({ 'a1   b': 1, _xyz: 3, '456': 456 })
})

test('[jsonx] JSONP解析取值', () => {
    expect(jsonx.parse(`   callback(((1,2,3,5,6,7)));  `)).toEqual(7)
    expect(jsonx.parse(`callback(([{a:1,  b: [{ccc:'ccc'}] },'2',3,,,6]));`)).toEqual([{ a: 1, b: [{ ccc: 'ccc' }] }, '2', 3, , , 6])
})