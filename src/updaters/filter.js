module.exports = {
  name: 'filter',
  desc: 'expects f to be a predicate and keeps all JSON elements for which f yields true.',
  func: (verbose, failEarly, p, argv) => (jsons, lines) => {
    let err = ''
    let jsons2 = []

    for (let index = 0; index < jsons.length; index++) {
      try {
        const obj = jsons[index]
        if (typeof p === 'undefined' || p(obj) === true) jsons2.push(obj)
      } catch (e) {
        const line = verbose ? 'Line ' + lines[index] + ': ' : ''
        err += line + e + '\n'
        if (failEarly) {
          process.stderr.write(err)
          process.exit(1)
        }
      }
    }

    return {err, jsons: jsons2}
  }
}