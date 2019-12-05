module.exports = {
  name: 'jsonBulk',
  desc: 'parses all tokens in one go, which is faster, but fails the whole bulk instead of just a single token if an error is thrown.',
  func: (verbose, failEarly, argv) => (tokens, lines) => {
    const parseToken = tokenParser(verbose, failEarly)
    
    const firstLine = lines[0] || -1
    const token = concatTokens(tokens)
    return parseToken(token, firstLine)
  }
}

function concatTokens (tokens) {
  let str = '['

  const tokensLen = tokens.length

  if (tokensLen === 0) str += ']'
  else if (tokensLen === 1) str += tokens[0] + ']'
  else {
    str += tokens[0]
    for (let index = 1; index < tokensLen; index++) str += ',' + tokens[index]
    str += ']'
  }

  return str
}

function tokenParser (verbose, failEarly) {
  return (token, firstLine) => {
    let err = ''
    let jsons = []

    try {
      jsons = JSON.parse(token)
    } catch (e) {
      const line = verbose > 0 ? '(Line ' + firstLine + ') ' : ''
      const info = verbose > 1 ? ' while parsing:\n' + token : ''
      err += line + e + info + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }

    return {err, jsons}
  }
}