module.exports = function (f, replacer, spaces) {
  return (jsonStrs, obj) => {
    let str = jsonStrs

    const obj2 = typeof f === 'undefined' ? obj : f(obj)
    if (typeof obj2 !== 'undefined') {
      if (Array.isArray(obj2)) {
        for (const obj3 in obj2) str += JSON.stringify(obj3, replacer, spaces) + '\n'
      } else str += JSON.stringify(obj2, replacer, spaces) + '\n'
    }

    return str
  }
}