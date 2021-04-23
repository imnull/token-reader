import { TToken } from '../type'
import { TJsonTokenType } from './type'
import { read } from './readers'



export const parse = (content: string) => {
    const stack: any[] = []
    read(content, node => {
    })
    return stack.pop()
}