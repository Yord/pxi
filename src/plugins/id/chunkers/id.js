module.exports = {
  name: 'id',
  desc: 'returns each chunk as a token.',
  func: ({}) => (data, prevLines) => (
    {err: [], tokens: [data], lines: [], lastLine: prevLines, rest: ''}
  )
}