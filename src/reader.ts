import { TReader, TToken, TAgent, TAgentFunction, TAgentAssets, TPlugin } from './type'
import { REG_BREAK } from './readers'

const buildToken = <T>(token: TToken<T>, seg: TAgentAssets<T>): TToken<T> => {
    if(!seg) {
        return null
    }
    if (Array.isArray(seg)) {
        const [raw, val = raw, type] = seg
        token.end = token.start + raw.length
        token.value = val
        token.type = type || token.type
    } else {
        token.end = token.start + seg.length
        token.value = seg
    }
    return token
}

const reducePlugins = <T>(plugins: TPlugin<T> | TPlugin<T>[], seg: TAgentAssets<T>, parent: TToken<T>, previous: TToken<T>) => {
    if(Array.isArray(plugins)) {
        return plugins.reduce((assets, fn) => reducePlugins(fn, assets, parent, previous), seg)
    } else {
        if(typeof plugins !== 'function') {
            return seg
        }
        return plugins(seg, parent, previous)
    }
}

const agentString = <T>(
    type: T,
    exp: string,
    nest: 0 | 1 | 2,
    weight: number,
    plugin: TPlugin<T> | TPlugin<T>[]
): TAgent<T> => {
    return (s: string, i: number, parent: TToken<T>, previous: TToken<T>): TToken<T> => {
        const matchValue = s.substring(i, i + exp.length)
        if (matchValue === exp) {
            return buildToken({
                weight,
                start: i,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
                end: s.length,
                value: ''
            }, reducePlugins(plugin, matchValue, parent, previous))
        }
    }
}

const agentRegExp = <T>(
    type: T,
    exp: RegExp,
    nest: 0 | 1 | 2,
    weight: number,
    plugin: TPlugin<T> | TPlugin<T>[]
): TAgent<T> => {
    return (s: string, i: number, parent: TToken<T>, previous: TToken<T>): TToken<T> => {
        const m = s.substring(i).match(exp)
        if (m && m.index === 0) {

            const matchValue = m[0]
            const next = s.substring(i + matchValue.length)
            if(!REG_BREAK.test(next)) {
                return null
            }
  
            return buildToken({
                weight,
                start: i,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
                end: s.length,
                value: ''
            }, reducePlugins(plugin, matchValue, parent, previous))
        }
        return null
    }
}

const agentFunction = <T>(
    type: T,
    exp: TAgentFunction<T>,
    nest: 0 | 1 | 2,
    weight: number,
    plugin: TPlugin<T> | TPlugin<T>[]
): TAgent<T> => {
    return (s, i, parent, previous): TToken<T> => {
        let seg = exp(s, i, parent, previous)
        if (seg) {
            return buildToken({
                weight,
                start: i,
                parent,
                type,
                originType: type,
                depth: parent ? parent.depth + 1 : 0,
                nest,
                end: s.length,
                value: ''
            }, reducePlugins(plugin, seg, parent, previous))
        }
        return null
    }
}

export const agent = <T>(
    type: T,
    expression: string | RegExp | TAgentFunction<T> | (string | RegExp | TAgentFunction<T>)[],
    nest: 0 | 1 | 2,
    weight: number = 0,
    plugin?: TPlugin<T> | TPlugin<T>[]
): TAgent<T> => {
    if (typeof expression === 'string') {
        return agentString(type, expression, nest, weight, plugin)
    } else if (typeof expression === 'function') {
        return agentFunction(type, expression, nest, weight, plugin)
    } else if (expression instanceof RegExp) {
        return agentRegExp(type, expression, nest, weight, plugin)
    } else if(Array.isArray(expression)) {
        const agents = expression.map(exp => agent<T>(type, exp, nest, weight, plugin))
        return (s, i, parent, previous) => {
            const tokens = agents.map(agent => agent(s, i, parent, previous)).filter(t => !!t)
            return tokens[0] || null
        }
    }
    return null
}

const createErrorMessage = (content: string, start: number) => {
    const contentStart = start - Math.min(start, 10)
    const contentEnd = start + 20
    const offset = start - contentStart
    return `\n    ${JSON.stringify(content.substring(contentStart, contentEnd)).slice(1, -1).replace(/\\n/g, ' ')}\n    ${' '.repeat(offset)}^`
}

export const recurrentReader = <T>(agents: TAgent<T>[], eof?: T): TReader<T> => {
    const reader = (
        content: string,
        callback: { (node: TToken<T>): void },
        start: number = 0,
        parent: TToken<T> = null,
        previous: TToken<T> = null
    ) => {
        const m = content.substring(start).match(/^\s+/)
        if(m) {
            start += m[0].length
        }

        const bingos = agents.map(agent => agent(content, start, parent, previous)).filter(t => !!t)
        if(bingos.length > 0) {
            const token = bingos.sort((a, b) => b.weight - a.weight)[0]
            callback(token)
            const { end } = token
            if (token.nest === 0) {
                previous = token
            } else if (token.nest === 1) {
                parent = token
                previous = null
            } else if (token.nest === 2) {
                previous = parent
                parent = previous ? previous.parent : null
            }
            reader(content, callback, end, parent, previous)
        } else {
            if(start < content.length) {
                throw `SyntaxError: Invalid or unexpected token ${createErrorMessage(content, start)}`
            } else {
                if(false && eof) {
                    callback({
                        type: eof,
                        originType: eof,
                        start,
                        end: start,
                        value: null,
                        depth: 0,
                        nest: 0,
                        weight: 0,
                        parent: null,
                    })
                }
            }
        }
    }
    return reader
}

export const charReader = <T>(agents: TAgent<T>[], leftType: T): TReader<T> => {

    let previous: TToken<T> = null
    let parent: TToken<T> = null

    const read: TReader<T> = (content, callback, start = 0) => {
        const len = content.length
        let leftStart = start
        for (let i = start; i < len; i++) {
            let token: TToken<T> = null
            if (agents.some(r => {
                token = r(content, i, parent, previous)
                return !!token
            })) {
                if (token.start - leftStart > 0) {
                    const leftToken: TToken<T> = {
                        weight: 0,
                        type: leftType,
                        originType: leftType,
                        start: leftStart,
                        end: token.start,
                        parent,
                        value: content.substring(leftStart, token.start),
                        depth: parent ? parent.depth + 1 : 0,
                        nest: 0,
                    }
                    callback(leftToken)
                    previous = leftToken
                }
                callback(token)
                if (token.nest === 0) {
                    previous = token
                } else if (token.nest === 1) {
                    previous = null
                    parent = token
                } else {
                    previous = parent
                    parent = previous ? previous.parent : null
                }
                leftStart = token.end
                i = leftStart - 1
            }
        }
        if (leftStart < content.length) {
            const leftToken: TToken<T> = {
                weight: 0,
                type: leftType,
                originType: leftType,
                start: leftStart,
                end: content.length,
                parent,
                value: content.substring(leftStart),
                depth: parent ? parent.depth + 1 : 0,
                nest: 0,
            }
            callback(leftToken)
        }
    }
    return read
}