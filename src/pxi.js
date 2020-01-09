const os   = require('os')
const path = require('path')

let PXI = {}
try {
  PXI   = require(path.join(os.homedir(), '.pxi'))
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND' || !e.message.match(/Cannot\sfind\smodule\s'.+\.pxi'/)) throw e
}

Object.assign(global, PXI.context || {})

module.exports = PXI