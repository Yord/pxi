const combinePlugin = field => (list, plugin = {}) => (
  list.concat(plugin[field] || [])
)

const combinePlugins = plugins => ({
  chunkers:      plugins.reduce(combinePlugin('chunkers'),      []),
  deserializers: plugins.reduce(combinePlugin('deserializers'), []),
  applicators:   plugins.reduce(combinePlugin('applicators'),   []),
  marshallers:   plugins.reduce(combinePlugin('marshallers'),   [])
})

const combineDefault = field => (def, defaults = {}) => (
  typeof def !== 'undefined' ? def : defaults[field]
)

const combineDefaults = defaults => ({
  chunker:      defaults.reduce(combineDefault('chunker'),      undefined),
  deserializer: defaults.reduce(combineDefault('deserializer'), undefined),
  applicator:   defaults.reduce(combineDefault('applicator'),   undefined),
  marshaller:   defaults.reduce(combineDefault('marshaller'),   undefined),
  noPlugins:    defaults.reduce(combineDefault('noPlugins'),    undefined)
})

const initFunctions = (argv, plugins, defaults, fallbacks) => {
  const chunker    =   argv.chunker      || argv.c || defaults.chunker
  const marshaller =   argv.marshaller   || argv.m || defaults.marshaller
  const deserializer = argv.deserializer || argv.d || defaults.deserializer
  const applicator =   argv.applicator   || argv.a || defaults.applicator
  
  const functions  = argv._.length > 0 ? argv._ : ['json => json']
  const fs         = functions.map(eval)
  
  const chunk       = selectPlugin(chunker,      plugins.chunkers,      fallbacks.chunker     )(argv)
  const deserialize = selectPlugin(deserializer, plugins.deserializers, fallbacks.deserializer)(argv)
  const apply       = selectPlugin(applicator,   plugins.applicators,   fallbacks.applicator  )(fs, argv)
  const marshal     = selectPlugin(marshaller,   plugins.marshallers,   fallbacks.marshaller  )(argv)

  return {chunk, deserialize, apply, marshal}
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