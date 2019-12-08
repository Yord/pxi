module.exports = (lexers, parsers, transformers, marshallers) => (lexerDefault, parserDefault, transformerDefault, marshallerDefault) => (
  require('yargs')
  .usage('Usage: $0 [options]')
  
  .help('h')
  .alias('h', 'help')
  .describe(
    'help',
    'Shows this help message.'
  )

  .nargs('lexer', 1)
  .alias('l', 'lexer')
  .describe(
    'lexer',
    'Defines how the input is tokenized: ' +
    describePlugins(lexers, lexerDefault)
  )

  .nargs('parser', 1)
  .alias('p', 'parser')
  .describe(
    'parser',
    'Defines how tokens are parsed into JSON: ' +
    describePlugins(parsers, parserDefault)
  )

  .nargs('function', 1)
  .alias('f', 'function')
  .describe(
    'function',
    'Defines how JSON is transformed: "json => json" (default) If no function string is given, the identity function is used. "json => ..." All variables and functions in global scope may be used in the function. If you would like to use libraries like lodash or ramda, read the documentation on .pfrc on the github page.'
  )

  .nargs('applicator', 1)
  .alias('a', 'applicator')
  .describe(
    'applicator',
    'Defines how the function f is applied to JSON: ' +
    describePlugins(transformers, transformerDefault)
  )

  .nargs('marshaller', 1)
  .alias('m', 'marshaller')
  .describe(
    'marshaller',
    'Defines how the transformed JSON is brought back to a string: ' +
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
  return plugins.flatMap(describePlugin(defaultName)).join(' ')
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