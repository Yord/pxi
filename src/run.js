module.exports = (lex, parse, update) => {
  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    const {tokens, lines, rest} = lex(data + chunk)
    const {parseErr, jsons}     = parse(tokens, lines)
    const {updateErr, out}      = update(jsons, lines)

    if (parseErr  !== '') process.stderr.write(parseErr  + '\n')
    if (updateErr !== '') process.stderr.write(updateErr + '\n')
    process.stdout.write(out)

    data = rest
  })
  .on('end', () => process.exit(0))
}