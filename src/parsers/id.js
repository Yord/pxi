module.exports = {
  name: 'id',
  desc: 'returns all tokens unchanged.',
  func: (verbose, failEarly, argv) => (tokens, lines) => ({err: '', jsons: tokens})
}