const combinePlugin = field => (list, plugin = {}) => (
  list.concat(plugin[field] || [])
)

const combinePlugins = plugins => ({
  chunkers:    plugins.reduce(combinePlugin('chunkers'),    []),
  parsers:     plugins.reduce(combinePlugin('parsers'),     []),
  applicators: plugins.reduce(combinePlugin('applicators'), []),
  marshallers: plugins.reduce(combinePlugin('marshallers'), [])
})

const combineDefault = field => (def, defaults = {}) => (
  typeof def !== 'undefined' ? def : defaults[field]
)

const combineDefaults = defaults => ({
  chunker:    defaults.reduce(combineDefault('chunker'),    undefined),
  parser:     defaults.reduce(combineDefault('parser'),     undefined),
  applicator: defaults.reduce(combineDefault('applicator'), undefined),
  marshaller: defaults.reduce(combineDefault('marshaller'), undefined),
  noPlugins:  defaults.reduce(combineDefault('noPlugins'),  undefined)
})

const initFunctions = (argv, plugins, defaults, fallbacks) => {
  const chunker    = argv.chunker    || argv.c || defaults.chunker
  const marshaller = argv.marshaller || argv.m || defaults.marshaller
  const parser     = argv.parser     || argv.p || defaults.parser
  const applicator = argv.applicator || argv.a || defaults.applicator
  
  const functions  = argv._.length > 0 ? argv._ : ['json => json']
  const fs         = functions.map(eval)
  
  const chunk      = selectPlugin(chunker,    plugins.chunkers,    fallbacks.chunker   )(argv)
  const parse      = selectPlugin(parser,     plugins.parsers,     fallbacks.parser    )(argv)
  const apply      = selectPlugin(applicator, plugins.applicators, fallbacks.applicator)(fs, argv)
  const marshal    = selectPlugin(marshaller, plugins.marshallers, fallbacks.marshaller)(argv)

  return {chunk, parse, apply, marshal}
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