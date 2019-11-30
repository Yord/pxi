module.exports = (verbose, failEarly, update) => (tokens, lines) => {
  let err = ''
  let out = ''

  for(let i = 0; i < tokens.length; i++) {
    const str = tokens[i]

    try {
      const obj = JSON.parse(str)
      out = update(out, obj)
    } catch (e) {
      const line = verbose && lines[i]
      err += (verbose ? 'Line ' + line + ': ' : '') + e + ' while parsing ' + str + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }
  }

  return {out, err}
}