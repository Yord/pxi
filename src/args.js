module.exports = (
  require('yargs')
  .usage('Usage: $0 [options]')
  
  .alias('e', 'fail-early')
  .boolean('fail-early')
  .describe(
    'fail-early',
    'Usually, each error is caught and written to stderr. But if  ' +
    'this flag is set, only the first error is printed and the    ' +
    'process exits with exit code 1.'
  )

  .alias('f', 'function')
  .nargs('function', 1)
  .describe(
    'function',
    'A string containing a JavaScript function "json => ..." that ' +
    'is applied to each parsed JSON element. If the JSON element  ' +
    'is replaced depends on which "updater" is used. Read the     ' +
    'updater description to learn more. All imported libraries    ' +
    'and defined identifiers can be used by the function,         ' +
    'including those added in ".fxrc". If you would like to use   ' +
    'libraries like lodash or ramda, read the documentation on    ' +
    '".fxrc" on the github page.'
  )
  
  .alias('l', 'lexer')
  .nargs('lexer', 1)
  .describe(
    'lexer',
    'Defines which lexer is used: "line" (default) or             ' +
    '"streamObject". Line treats each line as one token.          ' +
    'StreamObject parses streams of JSON objects (not arrays!)    ' +
    'regardless of delimiter. If this setting gets any other      ' +
    'value, it treats an identifier with this name as a lexer or  ' +
    'fails, if no identifier is found.'
  )

  .alias('p', 'parser')
  .nargs('parser', 1)
  .describe(
    'parser',
    'Defines which parser is used: "bulk" (default) or "single".  ' +
    'Single parses each JSON object instead of bulks. Bulk        ' +
    'parsing is faster, but fails the whole bulk instead of just  ' +
    'a single JSON object if an error is thrown. If this setting  ' +
    'gets any other value, it treats an identifier with this name ' +
    'as a parser or fails, if no identifier is found.'
  )

  .alias('r', 'replacer')
  .nargs('replacer', 1)
  .describe(
    'replacer',
    'JSON.stringify is used to pretty print JSON. The replacer is ' +
    'passed to stringify and determines which JSON fields are     ' +
    'printed or left out. If it is set to null (default), all     ' +
    'fields are printed. See the documentation of JSON.stringify  ' +
    'to find out more.'
  )
  
  .alias('s', 'spaces')
  .nargs('spaces', 1)
  .describe(
    'spaces',
    'JSON.stringify is used to pretty print JSON. This is the     ' +
    'number of spaces used to format JSON. If it is set to 0      ' +
    '(default), the JSON is printed in a single line.'
  )

  .alias('u', 'updater')
  .nargs('updater', 1)
  .describe(
    'updater',
    'Defines which updater is used: "map" (default) or "flatMap". ' +
    'Map applies function f to each parsed JSON elements and      ' +
    'replaces it with f\'s result. FlatMap also applies f to each ' +
    'element, but acts differently depending on f\'s result: On   ' +
    'undefined, it drops the JSON element. In case of an array,   ' +
    'it prints every array item in its own line. For any other    ' +
    'element, it acts like map. If this setting gets any other    ' +
    'value, it treats an identifier with this name as an updater  ' +
    'or fails, if no identifier is found.'
  )

  .alias('v', 'verbose')
  .boolean('verbose')
  .describe(
    'verbose',
    'More verbose errors'
  )

  .help('h')
  .alias('h', 'help')
  .epilog('Copyright (c) Philipp Wille 2019')
  .argv
)