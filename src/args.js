module.exports = (
  require('yargs')
  .usage('Usage: $0 [options]')
  
  .alias('f', 'function')
  .nargs('function', 1)
  .describe(
    'function',
    'A JavaScript function on each parsed json "json => ..." that\n' +
    '(1) drops the json if it returns undefined or throws an error,\n' +
    '(2) returns each element as a line if it returns an array,\n' +
    '(3) or returns one line if it returns any other value.'
  )
  
  .alias('r', 'replacer')
  .nargs('replacer', 1)
  .describe(
    'replacer',
    'A replacer as defined by the JSON.stringify function'
  )
  
  .alias('s', 'spaces')
  .nargs('spaces', 1)
  .describe(
    'spaces',
    'The number of spaces used to format json or 0 for one line'
  )
  
  .alias('b', 'bulk-parsing')
  .boolean('bulk-parsing')
  .describe(
    'bulk-parsing',
    'Activates parsing bulks of json objects, which is faster, but fails ' +
    'the whole bulk instead of a single JSON object if an error is thrown'
  )

  .alias('e', 'fail-early')
  .boolean('fail-early')
  .describe(
    'fail-early',
    'Do not stream errors, but fail after the first error with exit code 1'
  )

  .alias('m', 'map')
  .boolean('map')
  .describe(
    'map',
    'Uses map instead of flatMap semantics, which returns undefined instead ' +
    'of dropping the result and returns arrays as one result instead of one ' +
    'result per element'
  )

  .boolean('v')
  .describe(
    'v',
    'More verbose errors'
  )

  .example(
    'Pretty printing with 2 spaces:',
    'echo \'{"foo":42}\' |\n' +
    'json-stream -s 2\n\n' +
    '> {\n' +
    '>   "foo": 42\n' +
    '> }\n'
  )
  
  .example(
    'Identity function on each json:',
    'echo \'{"foo":42}\' |\n' +
    'json-stream -f "json => json"\n\n' +
    '> {"foo":42}\n'
  )
  
  .example(
    'Select the foo attribute:',
    'echo \'{"bar":"baz"}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    'nothing is returned since f returns undefined\n' +
    '\n' +
    'echo \'{"foo":["bar","baz"]}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    '> bar\n' +
    '> baz\n' +
    '\n' +
    'echo \'{"foo":"bar"}\' |\n' +
    'json-stream -f "json => json.foo"\n' +
    '\n' +
    '> bar'
  )

  .help('h')
  .alias('h', 'help')
  .epilog('Copyright (c) Philipp Wille 2019')
  .argv
)