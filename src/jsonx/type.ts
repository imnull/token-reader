export type TJsonTokenType =
    'id'
    | 'null'
    | 'undefined'
    | 'number'
    | 'string'
    | 'date'
    
    | 'blank'   // 空白字符
    | 'comma'   // 逗号
    | 'colon'   // 冒号
    | 'semicolon'   // 分号
    | 'quote'    // 引号

    | 'bracket-round' // 小括号
    | 'bracket-round-comma'
    | 'bracket-round-end' // 小括号

    | 'bracket-square'  // 中括号
    | 'bracket-square-comma'
    | 'bracket-square-end'  // 中括号

    | 'bracket-wind'  // 大括号
    | 'bracket-wind-comma'
    | 'bracket-wind-end'  // 大括号
