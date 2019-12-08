module.exports = {
  name: 'flatMap',
  desc: 'applies f to each element, but acts differently depending on f\'s result: On undefined return nothing. On [...] return every array item individually or nothing for empty arrays. Otherwise act like map.',
  func: (verbose, failEarly, fs, argv) => (jsons, lines) => {
    let err = ''
    let jsons2 = []

    for (let index = 0; index < jsons.length; index++) {
      try {
        let objs = [jsons[index]]
        let objs2 = []
        for (let jndex = 0; jndex < fs.length; jndex++) {
          const f = fs[jndex]
          for (let undex = 0; undex < objs.length; undex++) {
            let obj = objs[undex]
            if (obj !== 'undefined') {
              obj = f(obj)
              if (typeof obj !== 'undefined') {
                if (Array.isArray(obj)) objs2 = objs2.concat(obj)
                else objs2.push(obj2)
              }
            }
          }
          objs = objs2
          objs2 = []
        }
        for (let jndex = 0; jndex < objs.length; jndex++) {
          const obj = objs[jndex]
          jsons2.push(obj)
        }
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