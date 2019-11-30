module.exports = (verbose, failEarly, argv) => {
  const replacer = argv.r || argv.replacer || null
  const spaces   = argv.s || argv.spaces   || 0

  return jsons => {
    let err = ''
    let str = ''

    for (let index = 0; index < jsons.length; index++) {
      try {
        const obj = jsons[index]
        str += JSON.stringify(obj, replacer, spaces) + '\n'
      } catch(e) {
        err += e + '\n'
        if (failEarly) {
          process.stderr.write(err)
          process.exit(1)
        }
      }
    }

    return {err, str}
  }
}