export type TXmlTokenType =
    'plain'
    | 'element' // (<)name
    | 'element-blank'
    | 'element-end' // <[name|/|DOCTYPE|!--](>)
    | 'element-close'   // (<)/
    | 'element-comment' // (<)!--
    | 'element-single' // (/)>
    | 'attribute-name'
    | 'attribute-value'
    | 'attribute-equal'
