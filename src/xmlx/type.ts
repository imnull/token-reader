export type TXmlTokenType =
    'text'
    | 'comment'
    | 'instruction'
    | 'element' // (<)name
    | 'element-blank'
    | 'element-end' // <[name|/|DOCTYPE|!--](>)
    | 'element-close'   // (<)/
    | 'element-single' // (/)>
    | 'attribute-name'
    | 'attribute-value'
    | 'attribute-equal'
