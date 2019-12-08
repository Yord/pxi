module.exports = {
  name: 'jsonStringify',
  desc: 'uses JSON.stringify and has the following additional options:\n\n-S, --spaces\nThe number of spaces used to format JSON. If it is set to 0 (default), the JSON is printed in a single line.    [number]\n\n-s, --select\nDetermines which JSON fields are kept. If it is left out (default), all fields remain. If it is a string formatted as a JSON array, all fields in the array are kept. See the documentation of JSON.stringify for details.        [string]\n\n',
  func: (verbose, failEarly, argv) => {
    const spaces    = argv.S || argv.spaces || 0
    const selectStr = argv.s || argv.select || null
    const select    = JSON.parse(selectStr) || null

    return jsons => {
      let err = ''
      let str = ''

      for (let index = 0; index < jsons.length; index++) {
        try {
          const obj = jsons[index]
          str += JSON.stringify(obj, select, spaces) + '\n'
        } catch (e) {
          const info = verbose > 1 ? ' while marshalling:\n' + JSON.stringify(obj, null, 2) : ''
          err += e + info + '\n'
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