module.exports = (verbose, failEarly, f, argv) => (jsons, lines) => {
  let err = ''
  let jsons2 = []

  for (let index = 0; index < jsons.length; index++) {
    try {
      const obj = jsons[index]
      const obj2 = typeof f === 'undefined' ? obj : f(obj)
      jsons2.push(obj2)
    } catch(e) {
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