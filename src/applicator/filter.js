module.exports = {
  name: 'filter',
  desc: 'expects f to be a predicate and keeps all JSON elements for which f yields true.',
  func: (verbose, failEarly, ps, argv) => (jsons, lines) => {
    let err = ''
    let jsons2 = []

    for (let index = 0; index < jsons.length; index++) {
      try {
        let obj = jsons[index]
        for (let jndex = 0; jndex < ps.length; jndex++) {
          const p = ps[jndex]
          if (typeof obj === 'undefined' || p(obj) === false) {
            obj = undefined
            break
          }
        }
        if (typeof obj !== 'undefined') jsons2.push(obj)
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