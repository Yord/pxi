const {anything, assert, constant, property} = require('fast-check')
const {func: lexer} = require('./id')

test('passes on data as one big token, ignoring lines completely', () => {
  const err       = []
  const argv      = anything().chain(verbose => constant({verbose}))
  const data      = anything()
  const prevLines = anything()

  assert(
    property(data, prevLines, (data, prevLines) =>
      expect(
        lexer(argv)(data, prevLines)
      ).toStrictEqual(
        {err, tokens: [data], lines: [], lastLine: prevLines, rest: ''}
      )
    )
  )
})