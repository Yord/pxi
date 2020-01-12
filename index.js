#!/usr/bin/env node

const _runner      = require('./src/runner')
const _api         = require('./src/api')

const _reference   = require('./reference.json')
_reference.plugins = _reference.plugins.map(require)

const _PXI         = require('./src/dotPxi') || {}
const _defaults    = _api.combineDefaults([_PXI.defaults, _reference.defaults])

const _globalArgv  = require('./src/globalArgs')(process.argv.slice(2), _defaults)
const _noPlugins   = typeof _globalArgv.noPlugins !== 'undefined' ? _globalArgv.noPlugins : false

const _id          = require('./src/plugins/id')
const _plugins     = _api.combinePlugins([_id].concat(_PXI.plugins || []).concat(_noPlugins ? [] : _reference.plugins))
const _argv        = require('./src/args')(process.argv.slice(2), _defaults, _plugins)
const _fs          = _api.initFunctions(_argv, _plugins, _defaults, _id)

const _run         = _runner(_argv.failEarly)

_run(_fs)