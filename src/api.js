const combinePlugin = field => (list, plugin = {}) => (
  list.concat(plugin[field] || [])
)

const combinePlugins = plugins => ({
  lexers:      plugins.reduce(combinePlugin('lexers'),      []),
  parsers:     plugins.reduce(combinePlugin('parsers'),     []),
  applicators: plugins.reduce(combinePlugin('applicators'), []),
  marshallers: plugins.reduce(combinePlugin('marshallers'), [])
})

const combineDefault = field => (def, defaults = {}) => (
  typeof def !== 'undefined' ? def : defaults[field]
)

const combineDefaults = defaults => ({
  lexer:      defaults.reduce(combineDefault('lexer'),      undefined),
  parser:     defaults.reduce(combineDefault('parser'),     undefined),
  applicator: defaults.reduce(combineDefault('applicator'), undefined),
  marshaller: defaults.reduce(combineDefault('marshaller'), undefined)
})

const initFunctions = (argv, plugins, defaults) => {
  const failEarly  = typeof argv.e !== 'undefined' ? argv.e : false
  const functions  = argv._.length > 0 ? argv._ : ['json => json']
  const lexer      = argv.l || defaults.lexer
  const marshaller = argv.m || defaults.marshaller
  const parser     = argv.p || defaults.parser
  const applicator = argv.a || defaults.applicator
  const verbose    = typeof argv.v !== 'undefined' ? argv.v : false
  
  const fs         = functions.map(eval)
  
  const lex        = selectPlugin(lexer,      plugins.lexers     )(verbose, failEarly, argv)
  const parse      = selectPlugin(parser,     plugins.parsers    )(verbose, failEarly, argv)
  const apply      = selectPlugin(applicator, plugins.applicators)(verbose, failEarly, fs, argv)
  const marshal    = selectPlugin(marshaller, plugins.marshallers)(verbose, failEarly, argv)

  return {lex, parse, apply, marshal}
}

function selectPlugin (name, plugins) {
  const p = plugins.find(p => p.name === name)
  return typeof p === 'undefined' ? () => {} :
         p.func   === 'undefined' ? () => {}
                                  : p.func
}

module.exports = {
  combinePlugins,
  combineDefaults,
  initFunctions
}