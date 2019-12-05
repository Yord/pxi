module.exports = (lex, parse, update, marshal) => {
  process.stdin.setEncoding('utf8')

  let buffer      = ''
  let linesOffset = 0

  process.stdin
  .on('data', chunk => {
    const {err: lErr, tokens, lines, lastLine, rest} = lex(buffer + chunk, linesOffset)
    const {err: pErr, jsons}                         = parse(tokens, lines)
    const {err: uErr, jsons: jsons2}                 = update(jsons, lines)
    const {err: mErr, str}                           = marshal(jsons2)

    if (lErr !== '') process.stderr.write(lErr + '\n')
    if (pErr !== '') process.stderr.write(pErr + '\n')
    if (uErr !== '') process.stderr.write(uErr + '\n')
    if (mErr !== '') process.stderr.write(mErr + '\n')
    process.stdout.write(str)

    buffer      = rest
    linesOffset = lastLine
  })
  .on('end', () => process.exit(0))
}