module.exports = (lexers, parsers, applicators, marshallers) => (lexerDefault, parserDefault, applicatorDefault, marshallerDefault) => (
  require('yargs')
  .usage(
    '$0 FUNCTIONS ... [OPTIONS ...] \n' +
    '\n' +
    'FUNCTIONS define how JSON is transformed. If several functions are given, they  ' +
    'are applied in order. If no function is given, "json => json" is used, instead. ' +
    'All variables and functions in global scope may be used in the function. If you ' +
    'would like to use libraries like lodash or ramda, read the .pfrc section on the ' +
    'github page: https://github.com/Yord/pf                                 [string]'
  )

  .help('h')
  .alias('h', 'help')
  .describe(
    'help',
    'Shows this help message.'
  )

  .string('lexer')
  .nargs('lexer', 1)
  .alias('l', 'lexer')
  .choices('lexer', lexers.map(plugin => plugin.name))
  .describe(
    'lexer',
    'Defines how the input is tokenized: ' +
    describePlugins(lexers, lexerDefault)
  )

  .string('parser')
  .nargs('parser', 1)
  .alias('p', 'parser')
  .choices('parser', parsers.map(plugin => plugin.name))
  .describe(
    'parser',
    'Defines how tokens are parsed into JSON: ' +
    describePlugins(parsers, parserDefault)
  )

  .string('applicator')
  .nargs('applicator', 1)
  .alias('a', 'applicator')
  .choices('applicator', applicators.map(plugin => plugin.name))
  .describe(
    'applicator',
    'Defines how the function f is applied to JSON: ' +
    describePlugins(applicators, applicatorDefault)
  )

  .string('marshaller')
  .nargs('marshaller', 1)
  .alias('m', 'marshaller')
  .choices('marshaller', marshallers.map(plugin => plugin.name))
  .describe(
    'marshaller',
    'Defines how the transformed JSON is converted to a string: ' +
    describePlugins(marshallers, marshallerDefault)
  )

  .boolean('fail-early')
  .alias('e', 'fail-early')
  .describe(
    'fail-early',
    'Usually, every error is caught and written to stderr. But if ' +
    'this flag is set, only the first error is printed and the    ' +
    'process exits with code 1.'
  )

  .count('verbose')
  .alias('v', 'verbose')
  .describe(
    'verbose',
    'Adds lines to errors.'
  )

  .epilog('Copyright (c) Philipp Wille 2019')
  .argv
)

function describePlugins (plugins, defaultName) {
  return plugins.map(describePlugin(defaultName)).join(' ')
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