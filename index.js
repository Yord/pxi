#!/usr/bin/env node

require('./src/fxrc')

const argv = require('./src/args')
const run  = require('./src/run')

const functionString = argv.f || 'json => json'
const spaces         = argv.s || 0
const replacerString = argv.r || null
const bulkParsing    = argv.b || false
const failEarly      = argv.e || false
const mapSemantics   = argv.m || false
const verbose        = argv.v || false

run(functionString, spaces, replacerString, bulkParsing, failEarly, mapSemantics, verbose)