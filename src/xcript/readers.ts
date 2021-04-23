import { readQuote } from '../utils'
import { tokenReader, recurrentReader } from '../reader'
import { TJsonTokenType as T } from './type'
import { REG_NUMBER, REG_ID, readString } from '../readers'


const readers = [
    
    tokenReader<T>('null', 'null', 0),
    tokenReader<T>('undefined', 'undefined', 0),
    tokenReader<T>('id', REG_ID, 0),
    tokenReader<T>('number', REG_NUMBER, 0),
    tokenReader<T>('string', readString, 0),

    tokenReader<T>('declare', 'var', 0),
    tokenReader<T>('return', 'return', 0),
    tokenReader<T>('if', 'if', 0),
    tokenReader<T>('else', 'else', 0),
    tokenReader<T>('while', 'while', 0),
    tokenReader<T>('switch', 'switch', 0),
    tokenReader<T>('case', 'case', 0),
    tokenReader<T>('break', 'break', 0),

    tokenReader<T>('assign', '=', 0),

    tokenReader<T>('comma', ',', 0),
    tokenReader<T>('colon', ':', 0),
    tokenReader<T>('bracket-round', '(', 1),
    tokenReader<T>('bracket-round-end', ')', 2),
    tokenReader<T>('bracket-square', '[', 1),
    tokenReader<T>('bracket-square-end', ']', 2),
    tokenReader<T>('bracket-wind', '{', 1),
    tokenReader<T>('bracket-wind-end', '}', 2),
    
    
]

export const read = recurrentReader<T>(readers)