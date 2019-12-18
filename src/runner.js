module.exports = failEarly => {
  const handle = handler(failEarly)

  return ({lex, parse, apply, marshal}) => {
    process.stdin.setEncoding('utf8')

    let buffer      = ''
    let linesOffset = 0

    process.stdout.on('error', () => process.exit(1))
    process.stderr.on('error', () => process.exit(1))

    process.stdin
    .on('data', chunk => {
      const {tokens, lines, lastLine, rest} = handle(lex(buffer + chunk, linesOffset))
      const {jsons}                         = handle(parse(tokens, lines))
      const {jsons: jsons2}                 = handle(apply(jsons, lines))
      const {str}                           = handle(marshal(jsons2))
      
      process.stdout.write(str)

      buffer      = rest
      linesOffset = lastLine
    })
    .on('end',   () => process.exit(0))
    .on('error', () => process.exit(1))
  }
}

function handler (failEarly) {
  return obj => {
    const err = obj.err || []
    if (err.length > 0) {
      process.stderr.write(err.map(e => e + '\n').join(''))
      if (failEarly) process.exit(1)
    }
    return obj
  }
}