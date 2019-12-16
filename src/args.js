module.exports = (argv, {lexer, parser, applicator, marshaller}, {lexers, parsers, applicators, marshallers}) => (
  require('yargs/yargs')(argv)

  .parserConfiguration({"boolean-negation": false})

  .usage(
    '$0 FUNCTIONS ... [OPTIONS ...] \n' +
    '\n' +
    'FUNCTIONS define how JSON is transformed. If several functions are given, they  ' +
    'are applied in order. If no function is given, "json => json" is used, instead. ' +
    'All variables and functions in global scope may be used in the function. If you ' +
    'would like to use libraries like lodash or ramda, read the .pfrc section on the ' +
    'github page: https://github.com/Yord/pf                                 [string]'
  )

  .string('lexer')
  .nargs('lexer', 1)
  .alias('l', 'lexer')
  .choices('lexer', lexers.map(plugin => plugin.name))
  .describe(
    'lexer',
    'Defines how the input is split into tokens: ' +
    describePlugins(lexers, lexer)
  )

  .string('parser')
  .nargs('parser', 1)
  .alias('p', 'parser')
  .choices('parser', parsers.map(plugin => plugin.name))
  .describe(
    'parser',
    'Defines how tokens are parsed into JSON: ' +
    describePlugins(parsers, parser)
  )

  .string('applicator')
  .nargs('applicator', 1)
  .alias('a', 'applicator')
  .choices('applicator', applicators.map(plugin => plugin.name))
  .describe(
    'applicator',
    'Defines how FUNCTIONS are applied to JSON: ' +
    describePlugins(applicators, applicator)
  )

  .string('marshaller')
  .nargs('marshaller', 1)
  .alias('m', 'marshaller')
  .choices('marshaller', marshallers.map(plugin => plugin.name))
  .describe(
    'marshaller',
    'Defines how the transformed JSON is converted to a string: ' +
    describePlugins(marshallers, marshaller)
  )

  .boolean('fail-early')
  .alias('e', 'fail-early')
  .describe(
    'fail-early',
    'Usually, every error is caught and written to stderr. But if ' +
    'this flag is set, only the first error is printed and the    ' +
    'process exits with code 1.'
  )

  .boolean('no-plugins')
  .describe(
    'no-plugins',
    'Disables all plugins except those added in the .pfrc module. ' +
    'May be used if e.g. an alternative json plugin is used or    ' +
    'during plugin development.'
  )

  .count('verbose')
  .alias('v', 'verbose')
  .describe(
    'verbose',
    'Apply -v several times (-vv) to be more verbose. Level 1     ' +
    'pints lines in parser and applicator error messages. Level 2 ' +
    'also prints the tokens or JSON objects that failed to be     ' +
    'parsed or transformed.'
  )

  .help('h')
  .alias('h', 'help')
  .describe(
    'help',
    'Shows this help message.'
  )

  .version('version')
  .describe(
    'version',
    'Show version number.'
  )

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
      '"' + plugin.name + '"' +
      (plugin.name === defaultName ? ' (default) ' : ' ') +
      plugin.desc
    ]
  }
}