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

let _lex = undefined
try {
  _lex = (
    _lexer === 'streamObject' ? _streamObject(_verbose) :
    _lexer === 'line'         ? _line(_verbose)
                              : eval(_lexer)(_verbose)
  )
} catch(err) {
  _process.stderr.write('No lexer defined with name ' + _lexer + '!\n')
  _process.exit(1)
}

let _update = undefined
try {
  _update = (
    _updater === 'map'     ? _map(_f, _replacer, _spaces) :
    _updater === 'flatMap' ? _flatMap(_f, _replacer, _spaces)
                           : eval(_updater)(_f, _replacer, _spaces)
  )
} catch(err) {
  _process.stderr.write('No updater defined with name ' + _updater + '!\n')
  _process.exit(1)
}

let _parse = undefined
try {
  _parse = (
    _parser === 'bulk'   ? _bulk(_verbose, _failEarly, _update) :
    _parser === 'single' ? _single(_verbose, _failEarly, _update)
                         : eval(_parser)(_verbose, _failEarly, _update)
  )
} catch(err) {
  _process.stderr.write('No parser defined with name ' + _parser + '!\n')
  _process.exit(1)
}

_run(_lex, _parse)