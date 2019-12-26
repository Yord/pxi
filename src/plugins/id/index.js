module.exports = {
  lexers:      [require('./lexers/id')],
  parsers:     [require('./parsers/id')],
  applicators: [require('./applicators/id')],
  marshallers: [require('./marshallers/id')],

  lexer:       require('./lexers/id'),
  parser:      require('./parsers/id'),
  applicator:  require('./applicators/id'),
  marshaller:  require('./marshallers/id')
}