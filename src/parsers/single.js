module.exports = (verbose, failEarly) => (tokens, lines) => {
  let parseErr = ''
  let jsons = []

  for(let i = 0; i < tokens.length; i++) {
    const str = tokens[i]

    try {
      const obj = JSON.parse(str)
      jsons.push(obj)
    } catch (e) {
      const line = verbose && lines[i]
      parseErr += (verbose ? 'Line ' + line + ': ' : '') + e + ' while parsing ' + str + '\n'
      if (failEarly) {
        process.stderr.write(parseErr)
        process.exit(1)
      }
    }
  }

  return {parseErr, jsons}
}