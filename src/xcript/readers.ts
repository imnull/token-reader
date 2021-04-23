import { readQuote } from '../utils'
import { agent, recurrentReader } from '../reader'
import { TXcriptTokenType as T } from './type'
import { REG_NUMBER, REG_ID, readString } from '../readers'


const readers = [

    agent<T>('comma', ',', 0, 30),
    agent<T>('colon', ':', 0, 30),
    agent<T>('semicolon', ';', 0, 30),
    agent<T>('bracket-round', '(', 1, 30),
    agent<T>('bracket-round-end', ')', 2, 30),
    agent<T>('bracket-square', '[', 1, 30),
    agent<T>('bracket-square-end', ']', 2, 30),
    agent<T>('bracket-wind', '{', 1, 30),
    agent<T>('bracket-wind-end', '}', 2, 30),
    
    agent<T>('null', 'null', 0, 20),
    agent<T>('undefined', 'undefined', 0, 20),

    agent<T>('assign', '=', 0, 30),

    agent<T>('binary', [
        '+', '-', '*', '/', '%', '^', '|', '&', '>>>', '>>', '<<', '>=', '>', '<=', '<', '===', '==', '!==', '!='
    ], 0, 50),
    

    agent<T>('declare', 'var', 0, 10),
    agent<T>('return', 'return', 0, 10),
    agent<T>('if', 'if', 0, 10),
    agent<T>('else', 'else', 0, 10),
    agent<T>('while', 'while', 0, 10),
    agent<T>('switch', 'switch', 0, 10),
    agent<T>('case', 'case', 0, 10),
    agent<T>('break', 'break', 0, 10),

    agent<T>('id', REG_ID, 0),
    agent<T>('number', REG_NUMBER, 0),
    agent<T>('string', readString, 0),

    
    
    
]

export const read = recurrentReader<T>(readers, 'eof')