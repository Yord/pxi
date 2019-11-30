#!/usr/bin/env node

require('./src/fxrc')

const _mapUpdater            = require('./src/updaters/map')
const _flatMapUpdater        = require('./src/updaters/flatMap')
const _bulkParser            = require('./src/parsers/bulk')
const _singleParser          = require('./src/parsers/single')
const _lineLexer             = require('./src/lexers/line')
const _streamObjectLexer     = require('./src/lexers/stream/object')

const _argv                  = require('./src/args')
const _run                   = require('./src/run')

const _functionString        = _argv.f || 'json => json'
const _spaces                = _argv.s || 0
const _replacerString        = _argv.r || null
const _singleParsing         = _argv.p || false
const _failEarly             = _argv.e || false
const _flatMapSemantics      = _argv.m || false
const _verbose               = _argv.v || false
const _lexer                 = _argv.l || 'line'

const _f                     = eval(_functionString)
const _replacer              = eval(_replacerString)

const _lex = (
  _lexer === 'stream-object' ? _streamObjectLexer(_verbose)
                             : _lineLexer(_verbose)
)

const _concatJsonStrs = (
  _flatMapSemantics          ? _flatMapUpdater(_f, _replacer, _spaces)
                             : _mapUpdater(_f, _replacer, _spaces)
)

const _parse = (
  _singleParsing             ? _singleParser(_verbose, _failEarly, _concatJsonStrs)
                             : _bulkParser(_verbose, _failEarly, _concatJsonStrs)
)

_run(_lex, _parse)