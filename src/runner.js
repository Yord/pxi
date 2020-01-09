module.exports = failEarly => {
  const handle = handler(failEarly)

  return ({chunk, deserialize, apply, marshal}) => {
    process.stdin.setEncoding('utf8')

    let buffer      = ''
    let linesOffset = 0

    process.stdout.on('error', () => process.exit(1))
    process.stderr.on('error', () => process.exit(1))

    process.stdin
    .on('data', data => {
      const {chunks, lines, lastLine, rest} = handle(chunk(buffer + data, linesOffset))
      const {jsons}                         = handle(deserialize(chunks, lines))
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
      const msgs = err.map(({msg, line, info}) =>
        (typeof line !== 'undefined' ? '(Line ' + line + ') ' : '') +
        msg + 
        (typeof info !== 'undefined' ? ', in ' + info : '') +
        '\n'
      )
      process.stderr.write(msgs.join(''))
      if (failEarly) process.exit(1)
    }
    return obj
  }
}