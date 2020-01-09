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

const validPlugins = ['chunkers', 'deserializers', 'applicators', 'serializers']
validPlugins.map(field =>
  test(
    `combinePlugins works on ${field}`,
    () => testCombinePlugins(field, fieldPlugins => fieldPlugins[field])
  )
)

test('combinePlugins works on no other field', () => {
  const field = unicodeString().map(str => validPlugins.indexOf(str) > -1 ? str + str : str)
  property(field, field =>
    testCombinePlugins(field, () => undefined)
  )
})

function testCombineDefaults (field, f) {
  const defaults = integer(0, 20).chain(len =>
    array(option(anything(), 5).map(option => ({[field]: option})), len, len)
  )
  
  assert(
    property(defaults, (defaults) =>
      expect(
        combineDefaults(defaults)[field]
      ).toStrictEqual(
        f(defaults)
      )
    )
  )
}

const validDefaults = ['chunker', 'deserializer', 'applicator', 'serializer', 'noPlugins']
validDefaults.map(field =>
  test(
    `combineDefaults works on ${field}`,
    () => testCombineDefaults(field, defaults => {
      const elem = defaults.find(def => typeof def[field] !== 'undefined')
      return typeof elem === 'undefined' ? elem : elem[field] 
    })
  )
)

test('combineDefaults works on no other field', () => {
  const field = unicodeString().map(str => validDefaults.indexOf(str) > -1 ? str + str : str)
  property(field, field =>
    testCombineDefaults(field, () => undefined)  
  )
})

function testInitFunctions ([extension, option, alias, def, func], result, {pluginsEmpty, nameNotFound, funcNotFound} = {}, fallback) {
  const apdr = unicodeString(1, 20).chain(name =>
    oneof(...['option', 'alias', 'def'].map(constant)).map(oad => ({
      argv:      {
        _:           [],
        [option]:    oad === 'option' ? name : undefined,
        [alias]:     oad === 'alias'  ? name : undefined
      },
      defaults:  {
        [def]:       oad === 'def'    ? name : undefined
      },
      plugins:   {
        [extension]: pluginsEmpty ? [] :
                     nameNotFound   ? [{      func: () => () => result}] :
                     funcNotFound     ? [{name}]
                                      : [{name, func: () => () => result}]
      },
      fallbacks: Object.assign({}, ...fallbacks),
      result
    }))
  )

  assert(
    property(apdr, ({argv, plugins, defaults, fallbacks, result}) => {
      const g = initFunctions(argv, plugins, defaults, fallbacks)[func]
      expect(
        g && g() || 'does not work'
      ).toStrictEqual(
        pluginsEmpty || nameNotFound || funcNotFound ? fallback : result
      )
    })
  )
}

const validInits = [
  ['chunkers',      'chunker',      'c', 'chunker',      'chunk'      ],
  ['deserializers', 'deserializer', 'd', 'deserializer', 'deserialize'],
  ['applicators',   'applicator',   'a', 'applicator',   'apply'      ],
  ['serializers',   'serializer',   's', 'serializer',   'serialize'  ]
]
const fallback = 'fallback'
const fallbacks = validInits.map(init => ({[init[3]]: {func: () => () => fallback}}))

validInits.map(init =>
  test(`initFunctions initializes ${init[4]}`, () => {
    testInitFunctions(init, 42)
  })
)

test('initFunctions does not work on foo', () => {
  testInitFunctions(['foo', 'foo', 'foo', 'foo', 'foo'], 'does not work')
})

validInits.map(init =>
  test(`initFunctions fallbacks work if ${init[3]} plugins are undefined`, () => {
    testInitFunctions(init, 42, {pluginsEmpty: true}, fallback)
  })
)

validInits.map(init =>
  test(`initFunctions fallbacks work if a ${init[3]} plugin is not found by name`, () => {
    testInitFunctions(init, 42, {nameNotFound: true}, fallback)
  })
)

validInits.map(init =>
  test(`initFunctions fallbacks work if a ${init[3]} plugin does not have a func`, () => {
    testInitFunctions(init, 42, {funcNotFound: true}, fallback)
  })
)