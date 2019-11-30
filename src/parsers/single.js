module.exports = (verbose, failEarly, argv) => (tokens, lines) => {
  let err = ''
  let jsons = []

  for (let index = 0; index < tokens.length; index++) {
    const str = tokens[index]

    try {
      const obj = JSON.parse(str)
      jsons.push(obj)
    } catch (e) {
      const line = verbose && lines[index]
      err += (verbose ? 'Line ' + line + ': ' : '') + e + ' while parsing ' + str + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }
  }

  return {err, jsons}
}