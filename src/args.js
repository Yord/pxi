module.exports = (lexers, parsers, updaters, marshallers) => (lexerDefault, parserDefault, updaterDefault, marshallerDefault) => (
  require('yargs')
  .usage('Usage: $0 [options]')
  
  .help('h')
  .alias('h', 'help')
  .describe(
    'help',
    'Shows this help message.'
  )

  .alias('l', 'lexer')
  .nargs('lexer', 1)
  .describe(
    'lexer',
    'Defines how the input is tokenized: ' +
    describePlugins(lexers, lexerDefault) +
    ' If --lexer gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('p', 'parser')
  .nargs('parser', 1)
  .describe(
    'parser',
    'Defines how tokens are parsed into JSON: ' +
    describePlugins(parsers, parserDefault) +
    ' If --parser gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('f', 'function')
  .nargs('function', 1)
  .describe(
    'function',
    'Defines how JSON is transformed: "json => json" (default) If no function string is given, the identity function is used. "json => ..." All variables and functions in global scope may be used in the function. If you would like to use libraries like lodash or ramda, read the documentation on .pfrc on the github page.'
  )

  .alias('u', 'updater')
  .nargs('updater', 1)
  .describe(
    'updater',
    'Defines how the function f is applied to JSON: ' +
    describePlugins(updaters, updaterDefault) +
    ' If --updater gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('m', 'marshaller')
  .nargs('marshaller', 1)
  .describe(
    'marshaller',
    'Defines how the updated JSON is transformed back to a string: ' +
    describePlugins(marshallers, marshallerDefault) +
    ' If --marshaller gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('e', 'fail-early')
  .boolean('fail-early')
  .describe(
    'fail-early',
    'Usually, every error is caught and written to stderr. But if ' +
    'this flag is set, only the first error is printed and the    ' +
    'process exits with code 1.'
  )

  .alias('v', 'verbose')
  .boolean('verbose')
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
  return plugin => (
    '"' + plugin.name + '"' +
    (plugin.name === defaultName ? ' (default) ' : ' ') +
    plugin.desc
  )
}