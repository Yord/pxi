#!/usr/bin/env node

require('./src/fxrc')

const mapUpdater            = require('./src/updaters/map')
const flatMapUpdater        = require('./src/updaters/flatMap')
const bulkParser            = require('./src/parsers/bulk')
const singleParser          = require('./src/parsers/single')
const lineLexer             = require('./src/lexers/line')
const streamObjectLexer     = require('./src/lexers/stream/object')

const argv                  = require('./src/args')
const run                   = require('./src/run')

const functionString        = argv.f || 'json => json'
const spaces                = argv.s || 0
const replacerString        = argv.r || null
const singleParsing         = argv.p || false
const failEarly             = argv.e || false
const flatMapSemantics      = argv.m || false
const verbose               = argv.v || false
const lexer                 = argv.l || 'line'

const f                     = eval(functionString)
const replacer              = eval(replacerString)

const lex = (
  lexer === 'stream-object' ? streamObjectLexer(verbose)
                            : lineLexer(verbose)
)

const concatJsonStrs = (
  flatMapSemantics          ? flatMapUpdater(f, replacer, spaces)
                            : mapUpdater(f, replacer, spaces)
)

const parse = (
  singleParsing             ? singleParser(verbose, failEarly, concatJsonStrs)
                            : bulkParser(verbose, failEarly, concatJsonStrs)
)

run(lex, parse)