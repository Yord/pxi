#!/usr/bin/env node

const _run       = require('./src/run')
const _api       = require('./src/api')

const _base      = require('@pf/base')
const _json      = require('@pf/json')
const _PF        = require('./src/pfrc') || {}

const _reference = {lexer: 'line', parser: 'jsonBulk', applicator: 'map', marshaller: 'jsonStringify'}
const _defaults  = _api.combineDefaults([_PF.defaults, _reference])
const _plugins   = _api.combinePlugins([_base, _json].concat(_PF.plugins || []))

const _argv      = require('./src/args')(_defaults, _plugins)
const _fs        = _api.initFunctions(_argv, _plugins, _defaults)

_run(_fs)