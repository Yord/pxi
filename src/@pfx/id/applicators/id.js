module.exports = {
  name: 'id',
  desc: 'does not apply any functions and returns the JSON objects unchanged.',
  func: (fs, {}) => (jsons, lines) => (
    {err: [], jsons: jsons}
  )
}