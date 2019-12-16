module.exports = (argv, {noPlugins}) => {
  const args = (
    require('yargs/yargs')(argv)

    .parserConfiguration({"boolean-negation": false})

    .boolean('no-plugins')

    .help(false)
    .argv
  )

  args['noPlugins'] = typeof args['noPlugins'] === 'undefined' ? noPlugins : args['noPlugins']
  
  return args
}