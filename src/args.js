module.exports = (argv, {lexer, parser, applicator, marshaller}, {lexers, parsers, applicators, marshallers}) => (
  require('yargs/yargs')(argv)

  .parserConfiguration({"boolean-negation": false})

  .usage(
    '$0 FUNCTIONS ... [OPTIONS ...] \n' +
    '\n' +
    'FUNCTIONS define how JSON is transformed. If several functions are given, they '  +
    'are applied in order. If no function is given, "json => json" is used, instead. ' +
    'All variables and functions in global scope may be used in the function. If you ' +
    'would like to use libraries like lodash or ramda, read the .pfrc module section ' +
    'on the github page: https://github.com/Yord/pf#pfrc-module              [string]'
  )

  .group(
    ['lexer', 'parser', 'applicator', 'marshaller', 'fail-early', 'no-plugins', 'verbose'],  
    'OPTIONS:\n'
  )

  .group(
    ['help', 'version'],
    'OTHERS:\n'
  )

  .option('lexer', {
    type:     'string',
    nargs:    1,
    alias:    ['l'],
    choices:  lexers.map(plugin => plugin.name),
    describe: '\nDefines how the input is split into tokens: ' + describePlugins(lexers, lexer) + '\n'
  })

  .option('parser', {
    type:     'string',
    nargs:    1,
    alias:    ['from', 'p'],
    choices:  parsers.map(plugin => plugin.name),
    describe: '\nDefines how tokens are parsed into JSON: ' + describePlugins(parsers, parser) + '\n'
  })

  .option('applicator', {
    type:     'string',
    nargs:    1,
    alias:    ['a'],
    choices:  applicators.map(plugin => plugin.name),
    describe: '\nDefines how FUNCTIONS are applied to JSON: ' + describePlugins(applicators, applicator) + '\n'
  })

  .option('marshaller', {
    type:     'string',
    nargs:    1,
    alias:    ['to', 'm'],
    choices:  marshallers.map(plugin => plugin.name),
    describe: '\nDefines how the transformed JSON is converted to a string: ' + describePlugins(marshallers, marshaller) + '\n'
  })
  
  .option('fail-early', {
    type:     'boolean',
    describe: '\nUsually, every error is caught and written to stderr. But if this flag is set, only the first error is printed and the process exits with code 1.\n'
  })

  .option('no-plugins', {
    type:     'boolean',
    describe: '\nDisables all plugins except those added in the .pfrc module. Useful for plugin development. BEWARE: You may need to set new defaults in the .pfrc module!\n'
  })

  .option('verbose', {
    type:     'count',
    alias:    ['v'],
    describe: '\nApply -v several times (-vv) to be more verbose. Level 1 prints lines in parser and applicator error messages. Level 2 also prints the tokens or JSON objects that failed to be parsed or transformed.\n'
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
      '\n"' + plugin.name + '"' +
      (plugin.name === defaultName ? ' (default) ' : ' ') +
      plugin.desc
    ]
  }
}