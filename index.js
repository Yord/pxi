#!/usr/bin/env node

require('./src/pfrc')

const _process           = require('process')

const _PF                = global.PF    || {}
const _defaults          = _PF.defaults || {}

const _line              = require('./src/lexers/line')
const _jsonStream        = require('./src/lexers/json/stream')
const _id                = require('./src/parsers/id')
const _bulk              = require('./src/parsers/json/bulk')
const _single            = require('./src/parsers/json/single')
const _map               = require('./src/applicator/map')
const _flatMap           = require('./src/applicator/flatMap')
const _filter            = require('./src/applicator/filter')
const _toString          = require('./src/marshallers/toString')
const _stringify         = require('./src/marshallers/json/stringify')

const _lexers            = [_line, _jsonStream].concat(_PF.lexers || [])
const _parsers           = [_id, _single, _bulk].concat(_PF.parsers || [])
const _applicators       = [_map, _flatMap, _filter].concat(_PF.applicators || [])
const _marshallers       = [_toString, _stringify].concat(_PF.marshallers || [])

const _lexerDefault      = _defaults.lexer      || _line.name
const _parserDefault     = _defaults.parser     || _bulk.name
const _applicatorDefault = _defaults.applicator || _map.name
const _marshallerDefault = _defaults.marshaller || _stringify.name

const _argv              = require('./src/args')(_lexers, _parsers, _applicators, _marshallers)(_lexerDefault, _parserDefault, _applicatorDefault, _marshallerDefault)
const _run               = require('./src/run')

const _failEarly         = typeof _argv.e !== 'undefined' ? _argv.e : false
const _functionString    = _argv.f || 'json => json'
const _lexer             = _argv.l || _lexerDefault
const _marshaller        = _argv.m || _marshallerDefault
const _parser            = _argv.p || _parserDefault
const _applicator        = _argv.a || _applicatorDefault
const _verbose           = typeof _argv.v !== 'undefined' ? _argv.v : false

const _f                 = eval(_functionString)

let _lex                 = _selectPlugin('lexer', _lexer, _lexers)(_verbose, _failEarly, _argv)
let _parse               = _selectPlugin('parser', _parser, _parsers)(_verbose, _failEarly, _argv)
let _apply               = _selectPlugin('applicator', _applicator, _applicators)(_verbose, _failEarly, _f, _argv)
let _marshal             = _selectPlugin('marshaller', _marshaller, _marshallers)(_verbose, _failEarly, _argv)

_run(_lex, _parse, _apply, _marshal)

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