const {anything, assert, constant, property} = require('fast-check')
const {func: deserializer} = require('./id')

test('always passes chunks on', () => {
  const err    = []
  const argv   = anything().chain(verbose => constant({verbose}))
  const chunks = anything()
  const lines  = anything()

  assert(
    property(argv, chunks, lines, (argv, chunks, lines) =>
      expect(
        deserializer(argv)(chunks, lines)
      ).toStrictEqual(
        {err, jsons: chunks}
      )
    )
  )
})