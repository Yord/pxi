const {anything, array, assert, constant, integer, oneof, option, property, string, unicodeString} = require('fast-check')
const {combineDefaults, combinePlugins, initFunctions} = require('./api')

function testCombinePlugins (field, f) {
  const fieldPlugins = integer(0, 20).chain(len =>
    integer(0, len).chain(at =>
      array(anything(), len, len).map(data => ({
        plugins: [
          {[field]: data.slice(0, at)},
          {[field]: data.slice(at, len)}
        ],
        [field]: data
      }))
    )
  )
  
  assert(
    property(fieldPlugins, (fieldsPlugins) =>
      expect(
        combinePlugins(fieldsPlugins.plugins)[field]
      ).toStrictEqual(
        f(fieldsPlugins)
      )
    )
  )
}

const validPlugins = ['lexers', 'parsers', 'applicators', 'marshallers']
validPlugins.map(field =>
  test(
    `combinePlugins works on ${field}`,
    () => testCombinePlugins(field, fieldPlugins => fieldPlugins[field])
  )
)