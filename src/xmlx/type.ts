export type TXmlTokenType =
    'plain'
    | 'blank'
    | 'element' // (<)name
    | 'element-end' // <[name|/|DOCTYPE|!--](>)
    | 'element-close'   // (<)/
    // | 'element-doctype' // (<)!DOCTYPE
    | 'element-comment' // (<)!--
    | 'element-single' // (/)>
    | 'attribute-name'
    | 'attribute-value'
    | 'quote'
    | 'equal'
    | 'root'
