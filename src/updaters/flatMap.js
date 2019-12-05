module.exports = {
  name: 'flatMap',
  desc: 'applies f to each element, but acts differently depending on f\'s result: On undefined return nothing. On [...] return every array item individually or nothing for empty arrays. Otherwise act like map.',
  func: (verbose, failEarly, f, argv) => (jsons, lines) => {
    let err = ''
    let jsons2 = []

    for (let index = 0; index < jsons.length; index++) {
      try {
        const obj = jsons[index]
        const obj2 = typeof f === 'undefined' ? obj : f(obj)
        if (typeof obj2 !== 'undefined') {
          if (Array.isArray(obj2)) {
            for (let index = 0; index < obj2.length; index++) {
              const obj3 = obj2[index]
              jsons2.push(obj3)
            }
          } else jsons2.push(obj2)
        }
      } catch (e) {
        const line = verbose > 0 ? 'Line ' + lines[index] + ': '                               : ''
        const info = verbose > 1 ? ' while transforming:\n' + JSON.stringify(obj, null, 2) : ''
        err += line + e + info + '\n'
        if (failEarly) {
          process.stderr.write(err)
          process.exit(1)
        }
      }
    }

    return {err, jsons: jsons2}
  }
}