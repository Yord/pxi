module.exports = (
  require('yargs')
  .usage('Usage: $0 [options]')
  
  .help('h')
  .alias('h', 'help')
  .describe(
    'help',
    'Shows this help message.'
  )

  .alias('f', 'function')
  .nargs('function', 1)
  .describe(
    'function',
    'A string containing a JavaScript function "json => ..." that ' +
    'is applied to each parsed JSON element. If you would like to ' +
    'use libraries like lodash or ramda, read the documentation   ' +
    'on ".fxrc" on the github page.'
  )
  
  .alias('l', 'lexer')
  .nargs('lexer', 1)
  .describe(
    'lexer',
    'Defines which lexer is used to tokenize the input: "line"    ' +
    '(default) or "streamObject". Line treats each line as one    ' +
    'token. StreamObject parses streams of JSON objects (not      ' +
    'arrays!) and drops any characters between them. If this      ' +
    'setting gets any other value, it treats an identifier with   ' +
    'this name as a lexer or fails, if none is found.'
  )

  .alias('p', 'parser')
  .nargs('parser', 1)
  .describe(
    'parser',
    'Defines which parser is used to parse the tokens: "bulk"     ' +
    '(default) or "single". Single parses each token on its own.  ' +
    'Bulk parses all tokens in one go, which is faster, but fails ' +
    'the whole bulk instead of just a single token if an error is ' +
    'thrown. If this setting gets any other value, it treats an   ' +
    'identifier with this name as a parser or fails, if none is   ' +
    'found.'
  )

  .alias('u', 'updater')
  .nargs('updater', 1)
  .describe(
    'updater',
    'Defines which updater is used to apply f on the parsed JSON  ' +
    'elements: "map" (default) or "flatMap". Map applies function ' +
    'f to each parsed JSON element and replaces it with f\'s      ' +
    'result. FlatMap also applies f to each element, but acts     ' +
    'differently depending on f\'s result: On undefined, it drops ' +
    'the JSON element. In case of an array, it returns every      ' +
    'array item individually. For any other element, it acts like ' +
    'map. If this setting gets any other value, it treats an      ' +
    'identifier with this name as an updater or fails, if none is ' +
    'found.'
  )

  .alias('m', 'marshaller')
  .nargs('marshaller', 1)
  .describe(
    'marshaller',
    'Defines which marshaller is used to transform the updated    ' +
    'JSON elements to a string: Currently, only "stringify"       ' +
    '(default) is implemented which uses JSON.stringify to print  ' +
    'JSON elements. If this setting gets any other value, it      ' +
    'treats an identifier with this name as a marshaller or       ' +
    'fails, if none is found. Marshallers may define their own    ' +
    'command line parameters and so does stringify:             \n' +
    '-s, --spaces                                               \n' +
    'The number of spaces used to format JSON. If it is set to 0  ' +
    '(default), the JSON is printed in a single line.           \n' +
    '-r, --replacer                                             \n' +
    'The replacer is passed to stringify and determines which     ' +
    'JSON fields are printed or left out. If it is set to null    ' +
    '(default), all fields are printed. See the documentation of  ' +
    'JSON.stringify to find out more.'
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