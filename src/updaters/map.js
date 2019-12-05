module.exports = {
  name: 'map',
  desc: 'applies f to each parsed JSON element and replaces it with f\'s result.',
  func: (verbose, failEarly, f, argv) => (jsons, lines) => {
    let err = ''
    let jsons2 = []

    for (let index = 0; index < jsons.length; index++) {
      try {
        const obj = jsons[index]
        const obj2 = typeof f === 'undefined' ? obj : f(obj)
        jsons2.push(obj2)
      } catch (e) {
        const line = verbose > 0 ? 'Line ' + lines[index] + ': '                           : ''
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