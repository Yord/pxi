module.exports = function (functionString, spaces, replacerString, singleParsing, failEarly, flatMapSemantics, verbose, lexer) {
  const mapUpdater        = require('./updaters/map')
  const flatMapUpdater    = require('./updaters/flatMap')
  const bulkParser        = require('./parsers/bulk')
  const singleParser      = require('./parsers/single')
  const lineLexer         = require('./lexers/line')
  const streamObjectLexer = require('./lexers/stream/object')

  const f = eval(functionString)
  const replacer = eval(replacerString)
  
  const concatJsonStrs = (
    flatMapSemantics ? flatMapUpdater(f, replacer, spaces)
                     : mapUpdater(f, replacer, spaces)
  )

  const parse = (
    singleParsing ? singleParser(verbose, failEarly, concatJsonStrs)
                  : bulkParser(verbose, failEarly, concatJsonStrs)
  )

  const lex = (
    lexer === 'stream-object' ? streamObjectLexer(verbose) :
    lexer === 'line'          ? lineLexer(verbose)
                              : lineLexer(verbose)
  )

  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    const {tokens, lines, rest} = lex(data + chunk)

    data = rest

    const {out, err} = parse(tokens, lines)

    process.stderr.write(err)
    process.stdout.write(out)
  })
  .on('end', () => process.exit(0))
}