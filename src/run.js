module.exports = (lex, parse, update) => {
  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    const {tokens, lines, rest} = lex(data + chunk)

    data = rest

    const {parseErr, jsons} = parse(tokens, lines)

    const {updateErr, out} = update(jsons, lines)

    process.stderr.write(parseErr)
    process.stderr.write(updateErr)
    process.stdout.write(out)
  })
  .on('end', () => process.exit(0))
}