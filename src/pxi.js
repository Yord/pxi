module.exports = ({chunk, deserialize, apply, serialize}) => {
  let buffer      = ''
  let linesOffset = 0

  return (data, noMoreData) => {
    const {err: cErr, chunks, lines, lastLine, rest} = chunk(buffer + data, linesOffset, noMoreData)
    const {err: dErr, jsons}                         = deserialize(chunks, lines)
    const {err: aErr, jsons: jsons2}                 = apply(jsons, lines)
    const {err: sErr, str}                           = serialize(jsons2)

    const err = cErr.concat(dErr).concat(aErr).concat(sErr)

    buffer      = rest
    linesOffset = lastLine

    return {err, str}
  }
}