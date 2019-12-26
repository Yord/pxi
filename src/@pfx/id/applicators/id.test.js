const {anything, array, assert, constant, integer, jsonObject, property} = require('fast-check')
const {func: applicator} = require('./id')

test('does not apply function, returns input unchanged as output', () => {
  const err        = []
  const fs         = array(anything())
  const argv       = anything().map(verbose => constant({verbose}))
  const jsonsLines = integer(0, 10).chain(len =>
    array(jsonObject(), len, len).chain(jsons =>
      array(integer(), len, len).chain(lines =>
        constant({jsons, lines})
      )
    )
  )

  assert(
    property(fs, argv, jsonsLines, (fs, argv, {jsons, lines}) => {
      expect(
        applicator(fs, argv)(jsons, lines)
      ).toStrictEqual(
        {err, jsons}
      )
    })
  )
})