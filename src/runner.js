module.exports = failEarly => {
  const handle = handler(failEarly)

  return pxi => {
    process.stdin.setEncoding('utf8')

    process.stdout.on('error', () => process.exit(1))
    process.stderr.on('error', () => process.exit(1))

    process.stdin
    .on('data', data => {
      const {str} = handle(pxi(data, false))
      process.stdout.write(str)
    })
    .on('end',   () => {
      const {str} = handle(pxi('', true))
      process.stdout.write(str)
      process.exit(0)
    })
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