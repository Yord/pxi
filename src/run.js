module.exports = function (functionString, spaces, replacerString, bulkParsing, failEarly, mapSemantics, verbose) {
  const mapUpdater     = require('./updaters/map')
  const flatMapUpdater = require('./updaters/flatMap')
  const bulkParser     = require('./parsers/bulk')
  const singleParser   = require('./parsers/single')
  const objectLexer    = require('./lexers/object')

  const f = eval(functionString)
  const replacer = eval(replacerString)
  
  const concatJsonStrs = (
    mapSemantics
    ? mapUpdater(f, replacer, spaces)
    : flatMapUpdater(f, replacer, spaces)
  )

  const parse = (
    bulkParsing
    ? bulkParser(verbose, failEarly, concatJsonStrs)
    : singleParser(verbose, failEarly, concatJsonStrs)
  )

  const lex = objectLexer(verbose)

  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    data += chunk

    const {tokens, lines, rest} = lex(data)

    data = rest

    const {out, err} = parse(tokens, lines)

    process.stderr.write(err)
    process.stdout.write(out)
  })
  .on('end', () => process.exit(0))
}