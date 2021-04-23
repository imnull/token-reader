import { readQuote } from '../utils'
import { agent, recurrentReader } from '../reader'
import { TJsonTokenType as T } from './type'
import { REG_NUMBER, REG_ID, REG_DATE, readString } from '../readers'


const readers = [
    agent<T>('null', 'null', 0),
    agent<T>('undefined', 'undefined', 0),
    agent<T>('date', REG_DATE, 0),
    agent<T>('id', REG_ID, 0),
    agent<T>('number', REG_NUMBER, 0),
    agent<T>('string', readString, 0),
    agent<T>('comma', (s, i, parent) => {
        const char = s.charAt(i)
        if(char !== ',') {
            return null
        }
        if(parent) {
            if(parent.type === 'bracket') {
                return [char, char, 'bracket-comma']
            } else if(parent.type === 'parentheses') {
                return [char, char, 'parentheses-comma']
            } else if(parent.type === 'braces') {
                return [char, char, 'braces-comma']
            }
        }
        return char
    }, 0),
    agent<T>('colon', ':', 0),
    agent<T>('braces', '{', 1),
    agent<T>('braces-end', '}', 2),
    agent<T>('bracket', '[', 1),
    agent<T>('bracket-end', ']', 2),
    agent<T>('parentheses', '(', 1),
    agent<T>('parentheses-end', ')', 2),
]

export const read = recurrentReader<T>(readers)