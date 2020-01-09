module.exports = {
  name: 'id',
  desc: 'returns each chunk as a chunk.',
  func: ({}) => (data, prevLines) => (
    {err: [], chunks: [data], lines: [], lastLine: prevLines, rest: ''}
  )
}