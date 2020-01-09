module.exports = {
  chunkers:      [require('./chunkers/id')],
  deserializers: [require('./deserializers/id')],
  applicators:   [require('./applicators/id')],
  marshallers:   [require('./marshallers/id')],

  chunker:      require('./chunker/id'),
  deserializer: require('./deserializer/id'),
  applicator:   require('./applicators/id'),
  marshaller:   require('./marshallers/id')
}