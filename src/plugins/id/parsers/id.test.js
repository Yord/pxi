const {anything, assert, constant, property} = require('fast-check')
const {func: parser} = require('./id')

test('always passes tokens on', () => {
  const err    = []
  const argv   = anything().chain(verbose => constant({verbose}))
  const tokens = anything()
  const lines  = anything()

  assert(
    property(argv, tokens, lines, (argv, tokens, lines) =>
      expect(
        parser(argv)(tokens, lines)
      ).toStrictEqual(
        {err, jsons: tokens}
      )
    )
  )
})