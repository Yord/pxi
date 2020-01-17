const combinePlugin = field => (list, plugin = {}) => (
  list.concat(plugin[field] || [])
)

const combinePlugins = plugins => ({
  chunkers:      plugins.reduce(combinePlugin('chunkers'),      []),
  deserializers: plugins.reduce(combinePlugin('deserializers'), []),
  appliers:      plugins.reduce(combinePlugin('appliers'),      []),
  serializers:   plugins.reduce(combinePlugin('serializers'),   [])
})

const combineDefault = field => (def, defaults = {}) => (
  typeof def !== 'undefined' ? def : defaults[field]
)

const combineDefaults = defaults => ({
  chunker:      defaults.reduce(combineDefault('chunker'),      undefined),
  deserializer: defaults.reduce(combineDefault('deserializer'), undefined),
  applier:      defaults.reduce(combineDefault('applier'),      undefined),
  serializer:   defaults.reduce(combineDefault('serializer'),   undefined),
  noPlugins:    defaults.reduce(combineDefault('noPlugins'),    undefined)
})

const initFunctions = (argv, plugins, defaults, fallbacks) => {
  const chunker      = argv.chunker      || argv.c || argv.by   || defaults.chunker
  const serializer   = argv.serializer   || argv.s || argv.to   || defaults.serializer
  const deserializer = argv.deserializer || argv.d || argv.from || defaults.deserializer
  const applier      = argv.applier      || argv.a || argv.with || defaults.applier
  
  const functions  = argv._.length > 0 ? argv._ : ['json => json']
  const fs         = functions.map(eval)
  
  const chunk       = selectPlugin(chunker,      plugins.chunkers,      fallbacks.chunker     )(argv)
  const deserialize = selectPlugin(deserializer, plugins.deserializers, fallbacks.deserializer)(argv)
  const apply       = selectPlugin(applier,      plugins.appliers,      fallbacks.applier     )(fs, argv)
  const serialize   = selectPlugin(serializer,   plugins.serializers,   fallbacks.serializer  )(argv)

  return {chunk, deserialize, apply, serialize}
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