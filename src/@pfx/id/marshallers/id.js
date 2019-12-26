module.exports = {
  name: 'id',
  desc: 'applies Object.prototype.toString to the input and joins without newlines.',
  func: ({}) => jsons => {
    let str   = ''
    const err = []

    for (let index = 0; index < jsons.length; index++) {
      const obj = jsons[index]
      if (typeof obj !== 'undefined' && obj !== null) str += obj.toString()
    }

    return {err, str}
  }
}