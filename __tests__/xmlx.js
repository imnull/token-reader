const { xmlx } = require('../dist')

test('[xmlx] 标签自动补全', () => {
    expect(xmlx.parse(`<div>`).toString()).toEqual(`<div></div>`)
})

test('[xmlx] 原有格式保持', () => {
    expect(xmlx.parse(`<div  a="1"\t\n b="2">\t\n \t\n </div>`).toString()).toEqual(`<div  a="1"\t\n b="2">\t\n \t\n </div>`)
})

test('[xmlx] 引号封闭保持', () => {
    expect(xmlx.parse(`<div  a="1" b='2'></div>`).toString()).toEqual(`<div  a="1" b='2'></div>`)
})

test('[xmlx] 数据绑定识别', () => {
    const doc = xmlx.parse('<h1>123{{`\'x${`y` + `z`}z"`}}456</h1>')
    const binder = doc.query(n => n.nodeType === 7)
    expect(binder.toString()).toEqual('{{`\'x${`y` + `z`}z"`}}')
})

test('[xmlx] 属性节点查询', () => {
    const doc = xmlx.parse('<h1 style="color:{{`#fa0`}};">123{{`\'x${`y` + `z`}z"`}}456</h1>')
    const binder = doc.query(n => n.nodeType === 7)
    expect(binder.toString()).toEqual('{{`#fa0`}}')
})