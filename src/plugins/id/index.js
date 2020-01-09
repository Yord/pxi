module.exports = {
  chunkers:      [require('./chunkers/id')],
  deserializers: [require('./deserializers/id')],
  appliers:      [require('./appliers/id')],
  serializers:   [require('./serializers/id')],

  chunker:      require('./chunkers/id'),
  deserializer: require('./deserializers/id'),
  applier:      require('./appliers/id'),
  serializer:   require('./serializers/id')
}