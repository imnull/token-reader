import { TReader, TToken, TAgent, TAgentFunction, TAgentAssets, TPlugin, TReaderCallbackFactory as TRCF } from './type'
import { REG_BREAK } from './readers'

const buildToken = <T>(token: TToken<T>, seg: TAgentAssets<T>): TToken<T> => {
    if (!seg) {
        return null
    }
    if (Array.isArray(seg)) {
        const [raw, val = raw, type, nest] = seg
        token.end = token.start + raw.length
        token.value = val
        token.type = type || token.type
        token.nest = nest || token.nest
    } else {
        token.end = token.start + seg.length
        token.value = seg
    }
    return token
}

const reducePlugins = <T>(plugins: TPlugin<T> | TPlugin<T>[], assets: TAgentAssets<T>, parent: TToken<T>, previous: TToken<T>) => {
    if (Array.isArray(plugins)) {
        return plugins.reduce((seg, fn) => reducePlugins(fn, seg, parent, previous), assets)
    } else {
        if (typeof plugins !== 'function') {
            return assets
        }
        return plugins({ assets, parent, previous })
    }
}

const agentString = <T>(
    type: T,
    exp: string,
    nest: 0 | 1 | 2,
    weight: number,
    plugin: TPlugin<T> | TPlugin<T>[]
): TAgent<T> => {
    return (s, i, parent, previous, readerId, readerGroup): TToken<T> => {
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
                value: '',
                readerGroup,
                readerId,
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
    return (s, i, parent, previous, readerId, readerGroup) => {
        const m = s.substring(i).match(exp)
        if (m && m.index === 0) {

            const matchValue = m[0]
            const next = s.substring(i + matchValue.length)
            if (!REG_BREAK.test(next)) {
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
                value: '',
                readerId,
                readerGroup,
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
    return (s, i, parent, previous, readerId, readerGroup): TToken<T> => {
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
                value: '',
                readerId,
                readerGroup,
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
    plugin?: TPlugin<T> | TPlugin<T>[],
): TAgent<T> => {
    if (typeof expression === 'string') {
        return agentString(type, expression, nest, weight, plugin)
    } else if (typeof expression === 'function') {
        return agentFunction(type, expression, nest, weight, plugin)
    } else if (expression instanceof RegExp) {
        return agentRegExp(type, expression, nest, weight, plugin)
    } else if (Array.isArray(expression)) {
        const agents = expression.map(exp => agent<T>(type, exp, nest, weight, plugin))
        return (s, i, parent, previous, readerId, readerGroup) => {
            const tokens = agents.map(agent => agent(s, i, parent, previous, readerId, readerGroup)).filter(t => !!t)
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

const agentBingo = <T>(agents: TAgent<T>[], content: string, start: number, parent: TToken<T>, previous: TToken<T>, readerGroup: number) => {
    const bingos = agents.map((agent, index) => agent(content, start, parent, previous, index, readerGroup)).filter(t => !!t)
    if (bingos.length < 1) {
        return null
    }
    const token = bingos.sort((a, b) => b.weight - a.weight)[0]
    if (token.nest === 0) {
        previous = token
    } else if (token.nest === 1) {
        parent = token
        previous = null
    } else if (token.nest === 2) {
        previous = parent
        parent = previous ? previous.parent : null
    }
    return { token, parent, previous }
}

export const recurrentReader = <T>(agents: TAgent<T>[]): TReader<T> => {
    const reader = (
        content: string,
        callback: { (node: TToken<T>): void },
        start: number = 0,
        parent: TToken<T> = null,
        previous: TToken<T> = null
    ): number => {
        const m = content.substring(start).match(/^\s+/)
        if (m) {
            start += m[0].length
        }
        const bingo = agentBingo(agents, content, start, parent, previous, 0)
        if (!bingo) {
            return start
        } else {
            callback(bingo.token)
            return reader(content, callback, bingo.token.end, bingo.parent, bingo.previous)
        }
    }
    return reader
}

export const charReader = <T>(agents: TAgent<T>[], leftType: T): TReader<T> => {

    let previous: TToken<T> = null
    let parent: TToken<T> = null

    const read: TReader<T> = (content, callback, start) => {
        const len = content.length
        let leftStart = start
        for (let i = start; i < len; i++) {
            let token: TToken<T> = null
            if (agents.some((r, readerId) => {
                token = r(content, i, parent, previous, readerId, 0)
                return !!token
            })) {
                if (token.start - leftStart > 0) {
                    const leftToken: TToken<T> = {
                        readerGroup: 0,
                        readerId: -1,
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
                readerGroup: 0,
                readerId: -1,
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
        return len
    }
    return read
}

export const multiRecurrentReader = <TT>(agentsMain: TAgent<TT>[], ...agentsHelpers: TAgent<TT>[][]): TReader<TT> => {

    const groups = [agentsMain, ...agentsHelpers]

    const read = (
        content: string,
        callback: { (node: TToken<TT>): void },
        start: number = 0,
        parent: TToken<TT> = null,
        previous: TToken<TT> = null
    ): number => {
        
        const tmp = start
        groups.some((agents, groupIndex) => {
            const m = content.substring(start).match(/^\s+/)
            if (m) {
                start += m[0].length
            }

            let bingo = agentBingo(agents, content, start, parent, previous, groupIndex)
            if (bingo) {
                callback(bingo.token)
                parent = bingo.parent
                previous = bingo.previous
                start = bingo.token.end
                return true
            }
        })
        if(tmp === start) {
            return tmp
        } else {
            return read(content, callback, start, parent, previous)
        }
    }

    return read
}

export const combinTokenParserCallback = <S, T>(reducer: { (token: TToken<T>, stack: S): void }, ...factories: TRCF<S, T>[]): TRCF<S, T> => (stack) => {
    const callbacks = factories.map(f => f(stack))
    return token => {
        const cb = callbacks[token.readerGroup]
        if(typeof cb === 'function') {
            cb(token)
            typeof reducer === 'function' && reducer(token, stack)
        }
    }
}