import { readQuote } from '../utils'
import { tokenReader, recurrentReader } from '../reader'
import { TJsonTokenType as T } from './type'
import { REG_NUMBER, REG_ID, REG_DATE, readString } from '../readers'


const readers = [
    tokenReader<T>('declare', 'var', 0),
    tokenReader<T>('assign', '=', 0),
    tokenReader<T>('null', 'null', 0),
    tokenReader<T>('undefined', 'undefined', 0),
    tokenReader<T>('date', REG_DATE, 0),
    tokenReader<T>('id', REG_ID, 0),
    tokenReader<T>('number', REG_NUMBER, 0),
    tokenReader<T>('string', readString, 0),
    tokenReader<T>('comma', (s, i, parent) => {
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
    tokenReader<T>('colon', ':', 0),
    tokenReader<T>('braces', '{', 1),
    tokenReader<T>('braces-end', '}', 2),
    tokenReader<T>('bracket', '[', 1),
    tokenReader<T>('bracket-end', ']', 2),
    tokenReader<T>('parentheses', '(', 1),
    tokenReader<T>('parentheses-end', ')', 2),
]

export const read = recurrentReader<T>(readers, 'blank')