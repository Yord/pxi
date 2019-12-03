module.exports = {
  name: 'stringify',
  desc: 'uses JSON.stringify and has the following additional options:\n\n-s, --spaces\nThe number of spaces used to format JSON. If it is set to 0 (default), the JSON is printed in a single line.\n\n-r, --replacer\nDetermines which JSON fields are kept. If it is set to null (default), all fields remain. See the documentation of JSON.stringify for details.\n\n',
  func: (verbose, failEarly, argv) => {
    const spaces      = argv.s || argv.spaces   || 0
    const replacerStr = argv.r || argv.replacer || null
    const replacer    = eval(replacerStr)       || null

    return jsons => {
      let err = ''
      let str = ''

      for (let index = 0; index < jsons.length; index++) {
        try {
          const obj = jsons[index]
          str += JSON.stringify(obj, replacer, spaces) + '\n'
        } catch (e) {
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
}