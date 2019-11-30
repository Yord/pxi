module.exports = (verbose, failEarly, f, replacer, spaces) => (jsons, lines) => {
  let err = ''
  let out = ''

  for (let index = 0; index < jsons.length; index++) {
    try {
      const obj = jsons[index]
      const obj2 = typeof f === 'undefined' ? obj : f(obj)
      if (typeof obj2 !== 'undefined') {
        if (Array.isArray(obj2)) {
          for (const obj3 in obj2) str += JSON.stringify(obj3, replacer, spaces) + '\n'
        } else out += JSON.stringify(obj2, replacer, spaces) + '\n'
      }
    } catch(e) {
      const line = verbose ? 'Line ' + lines[index] + ': ' : ''
      err += line + e + '\n'
      if (failEarly) {
        process.stderr.write(err)
        process.exit(1)
      }
    }
  }

  return {err, out}
}