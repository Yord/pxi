module.exports = {
  chunkers:      [require('./chunkers/id')],
  deserializers: [require('./deserializers/id')],
  applicators:   [require('./applicators/id')],
  serializers:   [require('./serializers/id')],

  chunker:      require('./chunker/id'),
  deserializer: require('./deserializer/id'),
  applicator:   require('./applicators/id'),
  serializer:   require('./serializer/id')
}