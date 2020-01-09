module.exports = {
  chunkers:    [require('./chunkers/id')],
  parsers:     [require('./parsers/id')],
  applicators: [require('./applicators/id')],
  marshallers: [require('./marshallers/id')],

  chunker:     require('./chunker/id'),
  parser:      require('./parsers/id'),
  applicator:  require('./applicators/id'),
  marshaller:  require('./marshallers/id')
}