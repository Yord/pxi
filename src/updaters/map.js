module.exports = (f, replacer, spaces) => (jsonStrs, obj) => {
  let str = jsonStrs

  const obj2 = typeof f === 'undefined' ? obj : f(obj)
  str += JSON.stringify(obj2, replacer, spaces) + '\n'

  return str
}