module.exports = (verbose, failEarly, f, replacer, spaces) => (jsons, lines) => {
  let updateErr = ''
  let out = ''

  for (let index = 0; index < jsons.length; index++) {
    try {
      const obj = jsons[index]
      const obj2 = typeof f === 'undefined' ? obj : f(obj)
      out += JSON.stringify(obj2, replacer, spaces) + '\n'
    } catch(e) {
      const line = verbose ? 'Line ' + lines[index] + ': ' : ''
      updateErr += line + e + '\n'
      if (failEarly) {
        process.stderr.write(updateErr)
        process.exit(1)
      }
    }
  }

  return {updateErr, out}
}