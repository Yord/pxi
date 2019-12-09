module.exports = ({lex, parse, apply, marshal}) => {
  process.stdin.setEncoding('utf8')

  let buffer      = ''
  let linesOffset = 0

  process.stdout.on('error', () => process.exit(1))
  process.stderr.on('error', () => process.exit(1))

  process.stdin
  .on('data', chunk => {
    const {err: lErr, tokens, lines, lastLine, rest} = lex(buffer + chunk, linesOffset)
    const {err: pErr, jsons}                         = parse(tokens, lines)
    const {err: tErr, jsons: jsons2}                 = apply(jsons, lines)
    const {err: mErr, str}                           = marshal(jsons2)

    if (lErr !== '') process.stderr.write(lErr + '\n')
    if (pErr !== '') process.stderr.write(pErr + '\n')
    if (tErr !== '') process.stderr.write(tErr + '\n')
    if (mErr !== '') process.stderr.write(mErr + '\n')
    process.stdout.write(str)

    buffer      = rest
    linesOffset = lastLine
  })
  .on('end',   () => process.exit(0))
  .on('error', () => process.exit(1))
}