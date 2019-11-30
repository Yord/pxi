module.exports = (lex, parse) => {
  process.stdin.setEncoding('utf8')

  let data = ''

  process.stdin
  .on('data', chunk => {
    const {tokens, lines, rest} = lex(data + chunk)

    data = rest

    const {err, out} = parse(tokens, lines)

    process.stderr.write(err)
    process.stdout.write(out)
  })
  .on('end', () => process.exit(0))
}