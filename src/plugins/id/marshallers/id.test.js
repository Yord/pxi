const {anything, array, assert, constant, property} = require('fast-check')
const {func: marshaller} = require('./id')

test('returns input as toString without newlines', () => {
  const err   = []
  const argv  = anything().map(verbose => constant({verbose}))
  const jsons = array(anything()).map(jsons => jsons.filter(json => typeof json !== 'undefined' && json !== null))

  assert(
    property(argv, jsons, (argv, jsons) => {
      const str = jsons.map(json => json.toString()).join('')

      expect(
        marshaller(argv)(jsons)
      ).toStrictEqual(
        {err, str}
      ) 
    })
  )
})