module.exports = (verbose, failEarly) => (tokens, lines) => {
  const parseToken = tokenParser(verbose, failEarly)
  
  const firstLine = lines[0] || -1
  const token = concatTokens(tokens)
  return parseToken(token, firstLine)
}

function concatTokens (tokens) {
  let str = '['

  const tokensLen = tokens.length

  if (tokensLen === 0) str += ']'
  else if (tokensLen === 1) str += tokens[0] + ']'
  else {
    str += tokens[0]
    for(let i = 1; i < tokensLen; i++) str += ',' + tokens[i]
    str += ']'
  }

  return str
}

function tokenParser (verbose, failEarly) {
  return (token, firstLine) => {
    let err = ''
    let jsons = []

    try {
      const objs = JSON.parse(token)
      jsons = jsons.concat(objs)
    } catch (e) {
      const line = verbose ? 'Line ' + firstLine + ': ' : ''
      err += line + e + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }

    return {err, jsons}
  }
}