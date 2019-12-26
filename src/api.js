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
  marshaller: defaults.reduce(combineDefault('marshaller'), undefined),
  noPlugins:  defaults.reduce(combineDefault('noPlugins'),  undefined)
})

const initFunctions = (argv, plugins, defaults, fallbacks) => {
  const lexer      = argv.lexer      || argv.l || defaults.lexer
  const marshaller = argv.marshaller || argv.m || defaults.marshaller
  const parser     = argv.parser     || argv.p || defaults.parser
  const applicator = argv.applicator || argv.a || defaults.applicator
  
  const functions  = argv._.length > 0 ? argv._ : ['json => json']
  const fs         = functions.map(eval)
  
  const lex        = selectPlugin(lexer,      plugins.lexers,      fallbacks.lexer     )(argv)
  const parse      = selectPlugin(parser,     plugins.parsers,     fallbacks.parser    )(argv)
  const apply      = selectPlugin(applicator, plugins.applicators, fallbacks.applicator)(fs, argv)
  const marshal    = selectPlugin(marshaller, plugins.marshallers, fallbacks.marshaller)(argv)

  return {lex, parse, apply, marshal}
}

function selectPlugin (name, plugins, fallback) {
  if (typeof plugins === 'undefined') return fallback.func
  const p = plugins.find(p => p.name === name)
  return typeof p      === 'undefined' ? fallback.func :
         typeof p.func === 'undefined' ? fallback.func
                                       : p.func
}

module.exports = {
  combinePlugins,
  combineDefaults,
  initFunctions
}