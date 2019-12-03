#!/usr/bin/env node

require('./src/fxrc')

const _process           = require('process')

const pf                 = global.pf || {}
const _defaults          = pf.defaults || {}

const _line              = require('./src/lexers/line')
const _jsonStream        = require('./src/lexers/json/stream')
const _bulk              = require('./src/parsers/json/bulk')
const _single            = require('./src/parsers/json/single')
const _map               = require('./src/updaters/map')
const _flatMap           = require('./src/updaters/flatMap')
const _filter            = require('./src/updaters/filter')
const _stringify         = require('./src/marshallers/stringify')

const _lexers            = [_line, _jsonStream].concat(pf.lexers || [])
const _parsers           = [_single, _bulk].concat(pf.parsers || [])
const _updaters          = [_map, _flatMap, _filter].concat(pf.updaters || [])
const _marshallers       = [_stringify].concat(pf.marshallers || [])

const _lexerDefault      = _defaults.lexer      || _line.name
const _parserDefault     = _defaults.parser     || _bulk.name
const _updaterDefault    = _defaults.updater    || _map.name
const _marshallerDefault = _defaults.marshaller || _stringify.name

const _argv              = require('./src/args')(_lexers, _parsers, _updaters, _marshallers)(_lexerDefault, _parserDefault, _updaterDefault, _marshallerDefault)
const _run               = require('./src/run')

const _failEarly         = typeof _argv.e !== 'undefined' ? _argv.e : false
const _functionString    = _argv.f || 'json => json'
const _lexer             = _argv.l || _lexerDefault
const _marshaller        = _argv.m || _marshallerDefault
const _parser            = _argv.p || _parserDefault
const _updater           = _argv.u || _updaterDefault
const _verbose           = typeof _argv.v !== 'undefined' ? _argv.v : false

const _f                 = eval(_functionString)

let _lex                 = _selectPlugin('lexer', _lexer, _lexers)(_verbose, _failEarly, _argv)
let _parse               = _selectPlugin('parser', _parser, _parsers)(_verbose, _failEarly, _argv)
let _update              = _selectPlugin('updater', _updater, _updaters)(_verbose, _failEarly, _f, _argv)
let _marshal             = _selectPlugin('marshaller', _marshaller, _marshallers)(_verbose, _failEarly, _argv)

_run(_lex, _parse, _update, _marshal)

function _selectPlugin (type, name, plugins) {
  const p = plugins.find(p => p.name === name)
  if (typeof p === 'undefined') {
    _process.stderr.write('No ' + type + ' defined with name ' + name + '!\n')
    _process.exit(1)
    return () => {}
  } else {
    return p.func ? p.func : () => {}
  }
}