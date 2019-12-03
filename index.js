#!/usr/bin/env node

require('./src/fxrc')

const _process        = require('process')

const pf              = global.pf || {}

const _line           = require('./src/lexers/line')
const _jsonStream     = require('./src/lexers/json/stream')
const _bulk           = require('./src/parsers/json/bulk')
const _single         = require('./src/parsers/json/single')
const _map            = require('./src/updaters/map')
const _flatMap        = require('./src/updaters/flatMap')
const _filter         = require('./src/updaters/filter')
const _stringify      = require('./src/marshallers/stringify')

const _lexers         = [_line, _jsonStream].concat(pf.lexers || [])
const _parsers        = [_single, _bulk].concat(pf.parsers || [])

const _lexerDefault   = _line
const _parserDefault  = _bulk

const _argv           = require('./src/args')(_lexers, _parsers)(_lexerDefault.name, _parserDefault.name)
const _run            = require('./src/run')

const _failEarly      = typeof _argv.e !== 'undefined' ? _argv.e : false
const _functionString = _argv.f || 'json => json'
const _lexer          = _argv.l || _lexerDefault.name
const _marshaller     = _argv.m || 'stringify'
const _parser         = _argv.p || _parserDefault.name
const _updater        = _argv.u || 'map'
const _verbose        = typeof _argv.v !== 'undefined' ? _argv.v : false

const _f              = eval(_functionString)

let _lex = _catchUndefined('lexer', _lexer, lexer =>
  lexer === 'jsonStream' ? _jsonStream :
  lexer === 'line'       ? _line
                         : global[lexer]
)(_verbose, _failEarly, _argv)

let _parse = _selectPlugin('parser', _parser, _parsers)(_verbose, _failEarly, _argv)

let _update = _catchUndefined('updater', _updater, updater =>
  updater === 'map'     ? _map :
  updater === 'flatMap' ? _flatMap :
  updater === 'filter'  ? _filter
                        : global[updater]
)(_verbose, _failEarly, _f, _argv)

let _marshal = _catchUndefined('marshaller', _marshaller, marshaller =>
  marshaller === 'stringify' ? _stringify
                             : global[marshaller]
)(_verbose, _failEarly, _argv)

_run(_lex, _parse, _update, _marshal)

function _catchUndefined (type, field, choose) {
  let func
  try {
    func = choose(field)
  } catch (e) {
    _process.stderr.write('No ' + type + ' defined with name ' + field + '!\n')
    _process.exit(1)
  }
  return func
}

function _selectPlugin (type, name, plugins) {
  const p = plugins.find(p => p.name === name)
  if (typeof p === 'undefined') {
    _process.stderr.write('No ' + type + ' defined with name ' + name + '!\n')
    _process.exit(1)
    return () => {}
  } else {
    return p.func ? p.func : () => {}
  }
}