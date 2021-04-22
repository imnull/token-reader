export type TJsonTokenType =
    'id'
    | 'null'
    | 'undefined'
    | 'number'
    | 'string'
    | 'date'

    | 'declare'
    | 'return'
    | 'if'
    | 'else'
    | 'while'
    | 'switch'
    | 'case'
    | 'break'

    | 'assign'  // =
    | 'unary'   // + - ~ ! typeof void
    | 'logical' // && ||
    | 'binary' // + - * / % ^ | & > >= < <= == != === !== >> >>> <<
    
    | 'blank'   // 空白字符
    | 'comma'   // 逗号
    | 'colon'   // 冒号
    | 'semicolon'   // 分号
    | 'quote'    // 引号

    | 'parentheses' // 小括号
    | 'parentheses-comma'
    | 'parentheses-end' // 小括号

    | 'bracket'  // 中括号
    | 'bracket-comma'
    | 'bracket-end'  // 中括号

    | 'braces'  // 大括号
    | 'braces-comma'
    | 'braces-end'  // 大括号