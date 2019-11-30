#!/usr/bin/env node

require('./src/fxrc')

const argv = require('./src/args')
const run  = require('./src/run')

const functionString   = argv.f || 'json => json'
const spaces           = argv.s || 0
const replacerString   = argv.r || null
const singleParsing    = argv.p || false
const failEarly        = argv.e || false
const flatMapSemantics = argv.m || false
const verbose          = argv.v || false
const lexer            = argv.l || 'line'

run(functionString, spaces, replacerString, singleParsing, failEarly, flatMapSemantics, verbose, lexer)