export type TJsonTokenType =
    'plain'
    | 'null'
    | 'undefined'
    | 'number'
    | 'blank'   // 空白字符
    | 'comma'   // 逗号
    | 'colon'   // 冒号
    | 'semicolon'   // 分号
    | 'quote'    // 引号
    | 'parentheses' // 小括号
    | 'parentheses-end' // 小括号
    | 'bracket'  // 中括号
    | 'bracket-end'  // 中括号
    | 'braces'  // 大括号
    | 'braces-end'  // 大括号