const os = require('os')
const path = require('path')

try {
  require(path.join(os.homedir(), '.fxrc'))
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e
}