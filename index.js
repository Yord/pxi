#!/usr/bin/env node

const os = require('os')
const path = require('path')

try {
  require(path.join(os.homedir(), '.fxrc')) // Should be required before config.js usage.
} catch (err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

const argv = require('yargs')
  .usage('Usage: $0 [options]')
  
  .alias('f', 'function')
  .nargs('function', 1)
  .describe(
    'function',
    'A JavaScript function on each parsed json "json => ..." that\n' +
    '(1) drops the json if it returns undefined or throws an error,\n' +
    '(2) returns each element as a line if it returns an array,\n' +
    '(3) or returns one line if it returns any other value.'
  )
  
  .alias('r', 'replacer')
  .nargs('replacer', 1)
  .describe(
    'replacer',
    'A replacer as defined by the JSON.stringify function'
  )
  
  .alias('s', 'spaces')
  .nargs('spaces', 1)
  .describe(
    'spaces',
    'The number of spaces used to format json or 0 for one line'
  )
  
  .alias('b', 'bulk-parsing')
  .boolean('bulk-parsing')
  .describe(
    'bulk-parsing',
    'Activates parsing bulks of json objects, which is faster, but fails ' +
    'the whole bulk instead of a single JSON object if an error is thrown'
  )

  .alias('e', 'fail-early')
  .boolean('fail-early')
  .describe(
    'fail-early',
    'Do not stream errors, but fail after the first error with exit code 1'
  )

  .alias('m', 'map')
  .boolean('map')
  .describe(
    'map',
    'Uses map instead of flatMap semantics, which returns undefined instead ' +
    'of dropping the result and returns arrays as one result instead of one ' +
    'result per element'
  )

  .boolean('v')
  .describe(
    'v',
    'More verbose errors'
  )

  .example(
    'Pretty printing with 2 spaces:',
    'echo \'{"foo":42}\' |\n' +
    'json-stream -s 2\n\n' +
    '> {\n' +
    '>   "foo": 42\n' +
    '> }\n'
  )
  
  .example(
    'Identity function on each json:',
    'echo \'{"foo":42}\' |\n' +
    'json-stream -f "json => json"\n\n' +
    '> {"foo":42}\n'
  )
  
  .example(
    'Select the foo attribute:',
    'echo \'{"bar":"baz"}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    'nothing is returned since f returns undefined\n' +
    '\n' +
    'echo \'{"foo":["bar","baz"]}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    '> bar\n' +
    '> baz\n' +
    '\n' +
    'echo \'{"foo":"bar"}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    '> bar'
  )

  .help('h')
  .alias('h', 'help')
  .epilog('Copyright (c) Philipp Wille 2019')
  .argv

const functionString = argv.f || 'json => json'
const spaces         = argv.s || 0
const replacerString = argv.r || null
const bulkParsing    = argv.b || false
const failEarly      = argv.e || false
const mapSemantics   = argv.m || false
const verbose        = argv.v || false

run(functionString, spaces, replacerString, bulkParsing, failEarly, mapSemantics, verbose)

function run (functionString, spaces, replacerString, bulkParsing, failEarly, mapSemantics, verbose) {
  const f = eval(functionString)
  const replacer = eval(replacerString)
  
  const concatJsonStrs = (
    mapSemantics
    ? concatJsonStrsMap(f, replacer, spaces)
    : concatJsonStrsFlatMap(f, replacer, spaces)
  )

  const parse = (
    bulkParsing
    ? bulkParser(verbose, failEarly, concatJsonStrs)
    : singleParser(verbose, failEarly, concatJsonStrs)
  )

  const lex = lexer(verbose)

  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    data += chunk

    const {tokens, lines, rest} = lex(data)

    data = rest

    const {out, err} = parse(tokens, lines)

    process.stderr.write(err)
    process.stdout.write(out)
  })
  .on('end', () => process.exit(0))
}

function bulkParser (verbose, failEarly, concatJsonStrs) {
  return (tokens, lines) => {
    const firstLine = lines[0] || -1
    const token = concatTokens(tokens)
    return parseToken(firstLine, token)
  }

  function concatTokens (tokens) {
    let str = '['

    const tokensLen = tokens.length

    if (tokensLen === 0) str += ']'
    else if (tokensLen === 1) str += tokens[0] + ']'
    else {
      str += tokens[0]
      for(let i = 1; i < tokensLen; i++) str += ',' + tokens[i]
      str += ']'
    }

    return str
  }
  
  function parseToken (firstLine, token) {
    let err = ''
    let out = ''

    try {
      const objs = JSON.parse(token)
      for(const obj of objs) out = concatJsonStrs(out, obj)
    } catch (e) {
      const line = verbose ? 'Line ' + firstLine + ': ' : ''
      err += line + e + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }

    return {out, err}
  }
}

function singleParser (verbose, failEarly, concatJsonStrs) {
  return (tokens, lines) => {
    let err = ''
    let out = ''

    for(let i = 0; i < tokens.length; i++) {
      const str = tokens[i]
  
      try {
        const obj = JSON.parse(str)
        out = concatJsonStrs(out, obj)
      } catch (e) {
        const line = verbose && lines[i]
        err += (verbose ? 'Line ' + line + ': ' : '') + e + '\n'
        if (failEarly) {
          process.stderr.write(err)
          process.exit(1)
        }
      }
    }

    return {out, err}
  }
}

function concatJsonStrsMap (f, replacer, spaces) {
  return (jsonStrs, obj) => {
    let str = jsonStrs

    const obj2 = typeof f === 'undefined' ? obj : f(obj)
    str += JSON.stringify(obj2, replacer, spaces) + '\n'

    return str
  }
}

function concatJsonStrsFlatMap (f, replacer, spaces) {
  return (jsonStrs, obj) => {
    let str = jsonStrs

  const obj2 = typeof f === 'undefined' ? obj : f(obj)
  if (typeof obj2 !== 'undefined') {
    if (Array.isArray(obj2)) {
      for (const obj3 in obj2) str += JSON.stringify(obj3, replacer, spaces) + '\n'
    } else str += JSON.stringify(obj2, replacer, spaces) + '\n'
  }

  return str
  }
}

function lexer (verbose) {
  return data => {
    const tokens = []
    const lines  = []

    let text     = data
    let len      = text.length

    let at       = -1
    let line     = 1
    
    let escaped  = false
    let string   = false
    let inObj    = false

    let obj      = false
    let brackets = 0

    let done     = false
    let from     = 0
    let ch
    
    do {
      at++
      ch = text.charAt(at)

      if (verbose && ch === '\n') line++

      if (string) {
        if (escaped) escaped = false
        else {
          if (ch === '"') string = false
          else if (ch === '\\') escaped = true
        }
      } else {
        if (ch === '"') string = true
        else if (ch === '{') {
          if (brackets === 0) from = at
          inObj = true
          brackets++
        } else if (inObj && ch === '}') {
          brackets--
          if (brackets === 0) {
            inObj = false
            obj = true
          }
        }
      }

      if (at === len) done = true

      if (obj) {
        obj = false
        const token = text.slice(from, at + 1)
        tokens.push(token)
        if (verbose) lines.push(line)

        text = text.slice(at + 1, len)
        len = text.length
        at = -1
      }
    } while (!done)

    return {tokens, lines, rest: text}
  }
}
