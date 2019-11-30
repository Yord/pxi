#!/usr/bin/env node

require('./src/fxrc')

const _process                = require('process')

const _map                    = require('./src/updaters/map')
const _flatMap                = require('./src/updaters/flatMap')
const _bulk                   = require('./src/parsers/bulk')
const _single                 = require('./src/parsers/single')
const _line                   = require('./src/lexers/line')
const _streamObject           = require('./src/lexers/streamObject')

const _argv                   = require('./src/args')
const _run                    = require('./src/run')

const _failEarly              = _argv.e || false
const _functionString         = _argv.f || 'json => json'
const _lexer                  = _argv.l || 'line'
const _parser                 = _argv.p || 'bulk'
const _replacerString         = _argv.r || null
const _spaces                 = _argv.s || 0
const _updater                = _argv.u || 'map'
const _verbose                = _argv.v || false

const _f                      = eval(_functionString)
const _replacer               = eval(_replacerString)

let _lex = _catchUndefined('lexer', _lexer, lexer =>
  lexer === 'streamObject' ? _streamObject(_verbose) :
  lexer === 'line'         ? _line(_verbose)
                           : eval(lexer)(_verbose)
)

let _parse = _catchUndefined('parser', _parser, parser =>
  parser === 'bulk'   ? _bulk(_verbose, _failEarly) :
  parser === 'single' ? _single(_verbose, _failEarly)
                      : eval(parser)(_verbose, _failEarly)
)

let _update = _catchUndefined('updater', _updater, updater =>
  updater === 'map'     ? _map(_verbose, _failEarly, _f, _replacer, _spaces) :
  updater === 'flatMap' ? _flatMap(_verbose, _failEarly, _f, _replacer, _spaces)
                        : eval(updater)(_verbose, _failEarly, _f, _replacer, _spaces)
)

_run(_lex, _parse, _update)

function _catchUndefined (type, field, choose) {
  let func
  try {
    func = choose(field)
  } catch(err) {
    _process.stderr.write('No ' + type + ' defined with name ' + field + '!\n')
    _process.exit(1)
  }
  return func
}