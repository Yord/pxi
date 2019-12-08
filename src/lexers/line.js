module.exports = {
  name: 'line',
  desc: 'treats lines as tokens.',
  func: (verbose, failEarly, argv) => (data, linesOffset) => {
    const tokens = []
    const lines  = []
  
    let text     = data
    let len      = text.length
  
    let at       = -1
    let lastLine = linesOffset
    
    let obj      = false
  
    let done     = false
    let ch
    
    do {
      at++
      ch = text.charAt(at)
  
      if (ch === '\n') {
        if (verbose) lastLine++
        obj = true
      }
  
      if (at === len) done = true
  
      if (obj) {
        obj = false
        const token = text.slice(0, at)
        tokens.push(token)
        if (verbose) lines.push(lastLine)
  
        text = text.slice(at + 1, len)
        len = text.length
        at = -1
      }
    } while (!done)
  
    return {err: '', tokens, lines, lastLine, rest: text}
  }
}