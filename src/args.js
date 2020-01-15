module.exports = (argv, {chunker, deserializer, applier, serializer}, {chunkers, deserializers, appliers, serializers}) => (
  require('yargs/yargs')(argv)

  .parserConfiguration({"boolean-negation": false})

  .usage(
    '$0 FUNCTIONS ... [OPTIONS ...] \n' +
    '\n' +
    'FUNCTIONS define how JSON is transformed. If several functions are given, they '  +
    'are applied in order. If no function is given, "json => json" is used, instead. ' +
    'All variables and functions in global scope may be used in the function. If you ' +
    'would like to use libraries like lodash or ramda, read the .pxi module section ' +
    'on the github page: https://github.com/Yord/pxi#pxi-module              [string]'
  )

  .group(
    ['chunker', 'deserializer', 'applier', 'serializer', 'fail-early', 'no-plugins', 'verbose'],  
    'OPTIONS:\n'
  )

  .group(
    ['help', 'version'],
    'OTHERS:\n'
  )

  .option('chunker', {
    type:     'string',
    nargs:    1,
    alias:    ['c'],
    choices:  chunkers.map(plugin => plugin.name),
    describe: '\nDefines how the input is split into chunks: ' + describePlugins(chunkers, chunker) + '\n'
  })

  .option('deserializer', {
    type:     'string',
    nargs:    1,
    alias:    ['from', 'd'],
    choices:  deserializers.map(plugin => plugin.name),
    describe: '\nDefines how chunks are deserialized into JSON: ' + describePlugins(deserializers, deserializer) + '\n'
  })

  .option('applier', {
    type:     'string',
    nargs:    1,
    alias:    ['with', 'a'],
    choices:  appliers.map(plugin => plugin.name),
    describe: '\nDefines how FUNCTIONS are applied to JSON: ' + describePlugins(appliers, applier) + '\n'
  })

  .option('serializer', {
    type:     'string',
    nargs:    1,
    alias:    ['to', 's'],
    choices:  serializers.map(plugin => plugin.name),
    describe: '\nDefines how the transformed JSON is converted to a string: ' + describePlugins(serializers, serializer) + '\n'
  })
  
  .option('fail-early', {
    type:     'boolean',
    describe: '\nUsually, every error is caught and written to stderr. But if this flag is set, only the first error is printed and the process exits with code 1.\n'
  })

  .option('no-plugins', {
    type:     'boolean',
    describe: '\nDisables all plugins except those added in the .pxi module. Useful for plugin development. BEWARE: You may need to set new defaults in the .pxi module!\n'
  })

  .option('verbose', {
    type:     'count',
    alias:    ['v'],
    describe: '\nApply -v several times (-vv) to be more verbose. Level 1 prints lines in deserializer and applier error messages. Level 2 also prints the chunks or JSON objects that failed to be deserialized or transformed.\n'
  })

  .help('help')
  .option('help', {
    alias:    ['h'],
    describe: 'Shows this help message.\n'
  })

  .version('version')
  .option('version', {
    describe: 'Shows version number.\n'
  })

  .epilog('Copyright (c) Philipp Wille 2019')
  .argv
)

function describePlugins (plugins, defaultName) {
  return plugins.length === 0 ? 'None defined.' : plugins.map(describePlugin(defaultName)).join(' ')
}

function describePlugin (defaultName) {
  return plugin => {
    if (typeof plugin.name === 'undefined') return []
    else return [
      '\n\n"' + plugin.name + '"' +
      (plugin.name === defaultName ? ' (default) ' : ' ') +
      plugin.desc
    ]
  }
}