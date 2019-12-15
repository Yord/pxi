const os   = require('os')
const path = require('path')

let PF = {}
try {
  PF = require(path.join(os.homedir(), '.pfrc'))
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}

Object.assign(global, PF.context || {})

module.exports = PF