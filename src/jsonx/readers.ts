import { agent, recurrentReader } from '../reader'
import { TJsonTokenType as T } from './type'
import { REG_NUMBER, REG_ID, REG_DATE, readString } from '../readers'


export const readers = [
    agent<T>('null', 'null', 0),
    agent<T>('undefined', 'undefined', 0),
    agent<T>('date', REG_DATE, 0),
    agent<T>('boolean', ['true', 'false'], 0),
    agent<T>('id', REG_ID, 0),
    agent<T>('number', REG_NUMBER, 0),
    agent<T>('string', readString, 0),
    agent<T>('comma', (s, i, parent) => {
        const char = s.charAt(i)
        if(char !== ',') {
            return null
        }
        if(parent) {
            if(parent.type === 'bracket-square') {
                return [char, char, 'bracket-square-comma']
            } else if(parent.type === 'bracket-round') {
                return [char, char, 'bracket-round-comma']
            } else if(parent.type === 'bracket-wind') {
                return [char, char, 'bracket-wind-comma']
            }
        }
        return char
    }, 0),
    agent<T>('colon', ':', 0),
    agent<T>('bracket-wind', '{', 1),
    agent<T>('bracket-wind-end', '}', 2),
    agent<T>('bracket-square', '[', 1),
    agent<T>('bracket-square-end', ']', 2),
    agent<T>('bracket-round', '(', 1),
    agent<T>('bracket-round-end', ')', 2),
]

export const read = recurrentReader<T>(readers)