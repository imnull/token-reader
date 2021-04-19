import { TJsonTokenType } from './type'
import createTraverse from '../traverse'
export { read } from './readers'
export { parse } from './parser'
export const traverse = createTraverse<TJsonTokenType>()