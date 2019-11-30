module.exports = function (verbose) {
  return data => {
    const tokens = []
    const lines  = []

    let text     = data
    let len      = text.length

    let at       = -1
    let line     = 1
    
    let obj      = false

    let done     = false
    let ch
    
    do {
      at++
      ch = text.charAt(at)

      if (ch === '\n') {
        if (verbose) line++
        obj = true
      }

      if (at === len) done = true

      if (obj) {
        obj = false
        const token = text.slice(0, at)
        tokens.push(token)
        if (verbose) lines.push(line)

        text = text.slice(at + 1, len)
        len = text.length
        at = -1
      }
    } while (!done)

    return {tokens, lines, rest: text}
  }
}