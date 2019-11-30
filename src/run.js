module.exports = (lex, parse, update) => {
  process.stdin.setEncoding('utf8')

  let buffer = ''

  process.stdin
  .on('data', chunk => {
    const {tokens, lines, rest} = lex(buffer + chunk)
    const {err: parseErr, jsons}     = parse(tokens, lines)
    const {err: updateErr, out}      = update(jsons, lines)

    if (parseErr  !== '') process.stderr.write(parseErr  + '\n')
    if (updateErr !== '') process.stderr.write(updateErr + '\n')
    process.stdout.write(out)

    buffer = rest
  })
  .on('end', () => process.exit(0))
}