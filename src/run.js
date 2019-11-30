module.exports = (lex, parse, update, marshal) => {
  process.stdin.setEncoding('utf8')

  let buffer = ''

  process.stdin
  .on('data', chunk => {
    const {err: lexErr, tokens, lines, rest} = lex(buffer + chunk)
    const {err: parseErr, jsons}             = parse(tokens, lines)
    const {err: updateErr, jsons: jsons2}    = update(jsons, lines)
    const {err: marshalErr, str}             = marshal(jsons2)

    if (lexErr     !== '') process.stderr.write(lexErr     + '\n')
    if (parseErr   !== '') process.stderr.write(parseErr   + '\n')
    if (updateErr  !== '') process.stderr.write(updateErr  + '\n')
    if (marshalErr !== '') process.stderr.write(marshalErr + '\n')
    process.stdout.write(str)

    buffer = rest
  })
  .on('end', () => process.exit(0))
}