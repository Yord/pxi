module.exports = {
  name: 'toString',
  desc: 'applies Object.prototype.toString to the input.',
  func: (verbose, failEarly, argv) => jsons => {
    let str = ''

    for (let index = 0; index < jsons.length; index++) {
      const obj = jsons[index]
      str += obj.toString() + '\n'
    }

    return {err: '', str}
  }
}