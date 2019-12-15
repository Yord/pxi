#!/usr/bin/env node

const _run         = require('./src/run')
const _api         = require('./src/api')

const _reference   = require('./reference.json')
_reference.plugins = _reference.plugins.map(require)

const _PF          = require('./src/pfrc') || {}
const _defaults    = _api.combineDefaults([_PF.defaults, _reference.defaults])

const _globalArgv  = require('./src/globalArgs')(process.argv.slice(2), _defaults)
const _noPlugins   = typeof _globalArgv.noPlugins !== 'undefined' ? _globalArgv.noPlugins : false

const _plugins     = _api.combinePlugins(_PF.plugins.concat(_noPlugins ? [] : _reference.plugins))

const _argv        = require('./src/args')(process.argv.slice(2), _defaults, _plugins)
const _fs          = _api.initFunctions(_argv, _plugins, _defaults)

_run(_fs)