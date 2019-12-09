#!/usr/bin/env node

require('./src/pfrc')

const _run       = require('./src/run')
const A          = require('./src/api')

const _core      = require('@pf/core')
const _json      = require('@pf/json')
const _PF        = global.PF || {}

const _reference = {lexer: 'line', parser: 'jsonBulk', applicator: 'map', marshaller: 'jsonStringify'}
const _defaults  = A.combineDefaults([_PF.defaults, _reference])
const _plugins   = A.combinePlugins([_core, _json, _PF])

const _argv      = require('./src/args')(_defaults, _plugins)
const _fs        = A.initFunctions(_argv, _plugins, _defaults)

_run(_fs)