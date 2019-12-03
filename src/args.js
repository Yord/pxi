module.exports = (lexers, parsers, updaters) => (lexerDefault, parserDefault, updaterDefault) => (
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
    describePlugin(lexers, lexerDefault) +
    ' If --lexer gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('p', 'parser')
  .nargs('parser', 1)
  .describe(
    'parser',
    'Defines how tokens are parsed into JSON: ' +
    describePlugin(parsers, parserDefault) +
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
    describePlugin(updaters, updaterDefault) +
    ' If --updater gets any other string, the global scope is searched for a matching variable or function.'
  )

  .alias('m', 'marshaller')
  .nargs('marshaller', 1)
  .describe(
    'marshaller',
    'Defines how the updated JSON is transformed back to a string: "stringify" (default) uses JSON.stringify and has the following additional options:\n\n-s, --spaces\nThe number of spaces used to format JSON. If it is set to 0 (default), the JSON is printed in a single line.\n\n-r, --replacer\nDetermines which JSON fields are kept. If it is set to null (default), all fields remain. See the documentation of JSON.stringify for details.\n\nIf --marshaller gets any other string, the global scope is searched for a matching variable or function.'
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

function describePlugin (plugins, defaultName) {
  return plugins.map(p => '"' + p.name + '"' + (p.name === defaultName ? ' (default) ' : ' ') + p.desc).join(' ')
}