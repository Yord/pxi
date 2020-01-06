![pf teaser][teaser]

`pf` (parser functions) is a fast and extensible command-line data (e.g. JSON) processor similar to `jq` and `fx`.

[![node version][shield-node]][node]
[![npm version][shield-npm]][npm-package]
[![license][shield-license]][license]
[![PRs Welcome][shield-prs]][contribute]
[![linux unit tests status][shield-unit-tests-linux]][actions]
[![macos unit tests status][shield-unit-tests-macos]][actions]
[![windows unit tests status][shield-unit-tests-windows]][actions]

## Installation

Installation is done using the [global `npm install` command][npm].

```bash
$ npm install --global @pfx/pf
```

Try `pf --help` to see if the installation was successful.

## Features

+   :rocket: **Blazing fast:** >2x faster than `jq` and >10x faster than `fx` in transforming json.
+   :sparkles: **Highly extensible:** Trivial to write your own parser, lexer, and marshaller plugins.
+   :scream_cat: **Not limited to JSON:** Also supports parsing and writing other data formats via plugins.
+   :ram: **Configurable DSL:** Add Ramda, Lodash or any other library for transforming JSON.
+   :sweat_drops: **Streaming support:** Supports streaming JSON out of the box.

## Getting Started

Using `pf` to select all Unix timestamps from a large file containing all seconds of 2019 (602 MB, 31536000 lines) in JSON format takes ~18 seconds (macOS 10.15, 2.8 GHz i7 processor):

```bash
$ pf "json => json.time" < 2019.jsonl > out.jsonl
```

`jq` takes 2.5x longer (~46 seconds) and `fx` takes 16x longer (~290 seconds).
See the [performance](#performance) section for details.

`pf` also works on streams of JSON objects:

```json
$ curl -s "https://swapi.co/api/films/" |
  pf "json => json.results" -l jsonObj -a flatMap -K '["episode_id","title"]' |
  sort

{"episode_id":1,"title":"The Phantom Menace"}
{"episode_id":2,"title":"Attack of the Clones"}
{"episode_id":3,"title":"Revenge of the Sith"}
{"episode_id":4,"title":"A New Hope"}
{"episode_id":5,"title":"The Empire Strikes Back"}
{"episode_id":6,"title":"Return of the Jedi"}
{"episode_id":7,"title":"The Force Awakens"}
```

See the [usage](#usage) and [performance](#performance) sections below for more examples.

### Introductory Blogposts

For a quick start, read the following medium posts:

+   Getting started with `pf` (TODO)
+   Building `pf` from scratch (TODO)
+   Comparing `pf`'s performance to `jq` and `fx` (TODO)

## Parser Functions

The `pf` philosophy is to provide a small, robust frame for processing large data files and streams with JavaScript functions.
This involves lexing, parsing, applying functions, and marshalling data.
However, `pf` does not reinvent parsers and marshallers, but instead uses awesome libraries from Node.js' ecosystem to do the job.
But since most parser libraries need to know their full input in advance, `pf` supports them with lexing
by dividing large data files into chunks that are parsed independently.
It then applies functions on the parsed data.

Expressed in code, it works like this:

```javascript
function pf (chunk) {            // Data chunks are passed to pf from stdin.
  const tokens = lex(chunk)      // The chunks are lexed and tokens are identified.
  const jsons  = parse(tokens)   // The tokens get parsed into JSON objects. 
  const jsons2 = apply(f, jsons) // f is applied to each object and new JSON objects are returned.
  const string = marshal(jsons2) // The new objects are converted to a string.
  process.stdout.write(string)   // The string is written to stdout.
}
```

Lexing, parsing, and marshalling JSON is provided by the [`@pfx/json`][pfx-json] plugin.

### Plugins

The following plugins are available:

|                               | Lexers    | Parsers                    | Applicators                | Marshallers | `pf` |
|-------------------------------|-----------|----------------------------|----------------------------|-------------|:----:|
| [`@pfx/pf`][pfx-id]           | `id`      | `id`                       | `id`                       | `id`        |   ✓  |
| [`@pfx/base`][pfx-base]       | `line`    |                            | `map`, `flatMap`, `filter` | `toString`  |   ✓  |
| [`@pfx/json`][pfx-json]       | `jsonObj` | `json`                     |                            | `json`      |   ✓  |
| [`@pfx/dsv`][pfx-dsv]         |           | `csv`, `tsv`, `ssv`, `dsv` |                            | `csv`       |   ✕  |
| [`@pfx/sample`][pfx-sample]   | `sample`  | `sample`                   | `sample`                   | `sample`    |   ✕  |

The last column states which plugins come preinstalled in `pf`.
Refer to the `.pfrc` Module section to see how to enable more plugins and how to develop plugins.
New `pf` plugins are developed in the [`pf-sandbox`][pf-sandbox] repository.

### Performance

`@pfx/json`'s lexers and parsers are build for speed and beat [`jq`][jq] and [`fx`][fx] in several benchmarks (see medium post (TODO) for details):

|                 | `pf` (time) | `jq` (time) | `fx` (time) | `jq` (RAM) | `pf` (RAM) | `fx` (RAM) | all (CPU) |
|-----------------|------------:|------------:|------------:|-----------:|-----------:|-----------:|----------:|
| **Benchmark A** |     **18s** |         46s |        290s |    **1MB** |       46MB |       54MB |  **100%** |
| **Benchmark B** |     **42s** |        164s |        463s |    **1MB** |       48MB |       73MB |  **100%** |
| **Benchmark C** |     **14s** |         44s |         96s |    **1MB** |       48MB |       51MB |  **100%** |

`pf` beats `jq` and `fx` in processing speed in all three benchmarks.
Since `jq` is written in C, it easily beats `pf` and `fx` in RAM usage.
All three run single-threaded and use 100% of one CPU core.

## `.pfrc` Module

Users may extend and modify `pf` by providing a `.pfrc` module.
If you wish to do that, create a `~/.pfrc/index.js` file and insert the following base structure:

```js
module.exports = {
  plugins:  [],
  context:  {},
  defaults: {}
}
```

The following sections will walk you through all capabilities of `.pfrc` modules.
If you want to skip over the details and instead see sample code, visit [`pfx-pfrc`][pfx-pfrc]!

### Writing Plugins

You may write `pf` plugins in `~/.pfrc/index.js`.
Writing your own extensions is straightforward:

```js
const sampleLexer = {
  name: 'sample',
  desc: 'is a sample lexer.',
  func: ({verbose}) => (data, prevLines) => (
    // * Turn data into an array of tokens
    // * Count lines for better error reporting throughout pf
    // * Collect error reports: {msg: String, line: Number, info: String}
    //   If verbose > 0, include line in error reports
    //   If verbose > 1, include info in error reports
    // * Return errors, tokens, lines, the last line, and all unlexed data
    {err: [], tokens: [], lines: [], lastLine: 0, rest: ''}
  )
}

const sampleParser = {
  name: 'sample',
  desc: 'is a sample parser.',
  func: ({verbose}) => (tokens, lines) => (
    // * Parse tokens to jsons
    // * Collect error reports: {msg: String, line: Number, info: Token}
    //   If verbose > 0, include line in error reports
    //   If verbose > 1, include info in error reports
    // * Return errors and parsed jsons
    {err: [], jsons: []}
  )
}

const sampleApplicator = {
  name: 'sample',
  desc: 'is a sample applicator.',
  func: (functions, {verbose}) => (jsons, lines) => (
    // * Turn jsons into other jsons by applying all functions
    // * Collect error reports: {msg: String, line: Number, info: Json}
    //   If verbose > 0, include line in error reports
    //   If verbose > 1, include info in error reports
    // * Return errors and marshalled string
    {err: [], jsons: []}
  )
}

const sampleMarshaller = {
  name: 'sample',
  desc: 'is a sample marshaller.',
  func: ({verbose}) => jsons => (
    // * Turn jsons into a string
    // * Collect error reports: {msg: String, line: Number, info: Json}
    //   If verbose > 0, include line in error reports
    //   If verbose > 1, include info in error reports
    // * Return errors and marshalled string
    {err: [], str: ''}
  )
}
```

The `name` is used by `pf` to select your extension,
the `desc` is displayed in the options section of `pf --help`, and
the `func` is called by `pf` to transform data.

The sample extensions are bundled to the sample plugin, as follows:

```js
const sample = {
  lexers:      [sampleLexer],
  parsers:     [sampleParser],
  applicators: [sampleApplicator],
  marshallers: [sampleMarshaller]
}
```

### Extending `pf` with Plugins

Plugins can come from two sources:
They are either written by users, as shown in the previous section, or they are installed in `~/.pfrc/` as follows:

```bash
$ npm install @pfx/sample
```

If a plugin was installed from `npm`, it has to be imported into `~/.pfrc/index.js`:

```js
const sample = require('@pfx/sample')
```

Regardless of whether a plugin was defined by a user or installed from `npm`,
all plugins are added to the `.pfrc` module the same way:

```js
module.exports = {
  plugins:  [sample],
  context:  {},
  defaults: {}
}
```

`pf --help` should now list the sample plugin extensions in the options section.

> :speak_no_evil: Adding plugins may **break the `pf` command line tool**!
> If this happens, just remove the plugin from the list and `pf` should work normal again.
> Use this feature responsibly.

### Including Libraries like Ramda or Lodash

Libraries like [Ramda][ramda] and [Lodash][lodash] are of immense help when writing functions to transform JSON objects
and many heated discussions have been had, which of these libraries is superior.
Since different people have different preferences, `pf` lets the user decide which library to use.

First, install your preferred libraries in `~/.pfrc/`:

```bash
$ npm install ramda
$ npm install lodash
```

Next, add the libraries to `~/.pfrc/index.js`:

```js
const R = require('ramda')
const L = require('lodash')

module.exports = {
  plugins:  [],
  context:  Object.assign({}, R, {_: L}),
  defaults: {}
}
```

You may now use all Ramda functions without prefix, and all Lodash functions with prefix `_`:

```bash
$ pf "prop('time')" < 2019.jsonl > out.jsonl
$ pf "json => _.get(json, 'time')" < 2019.jsonl > out.jsonl
```

> :hear_no_evil: Using Ramda and Lodash may have a **negative impact on performance**! Use this feature responsibly.

### Including Custom JavaScript Functions

Just as you may extend `pf` with third-party libraries like Ramda and Lodash,
you may add your own functions to `pf`.

This is as simple as adding them to the context in `~/.pfrc/index.js`:

```js
const getTime = json => json.time

module.exports = {
  plugins:  [],
  context:  {getTime},
  defaults: {}
}
```

After adding it to the context, you call your function as follows:

```bash
$ pf "json => getTime(json)" < 2019.jsonl > out.jsonl
$ pf "getTime" < 2019.jsonl > out.jsonl
```

### Changing `pf` Defaults

You may **globally** change default lexers, parsers, applicators, and marshallers in `~/.pfrc/index.js`, as follows:

```js
module.exports = {
  plugins:  [],
  context:  {},
  defaults: {
    lexer:      'sample',
    parser:     'sample',
    applicator: 'sample',
    marshaller: 'sample',
    noPlugins:  false
  }
}
```

> :see_no_evil: Defaults are assigned **globally** and changing them may **break existing `pf` scripts**! Use this feature responsibly.

## Usage

Selecting all Unix timestamps from a file containing all seconds of 2019 (602 MB, 31536000 lines)
in JSON format (e.g. `{"time":1546300800}`) takes ~18 seconds (macOS 10.15, 2.8 GHz i7 processor):

```bash
$ pf "json => json.time" < 2019.jsonl > out.jsonl

1546300800
1546300801
...
1577836798
1577836799
```

Transforming Unix timestamps to an ISO string from the same file (602MB) takes ~42 seconds:

```bash
$ pf "json => (json.iso = new Date(json.time * 1000).toISOString(), json)" < 2019.jsonl > out.jsonl

{"time":1546300800,"iso":"2019-01-01T00:00:00.000Z"}
{"time":1546300801,"iso":"2019-01-01T00:00:01.000Z"}
...
{"time":1577836798,"iso":"2019-12-31T23:59:58.000Z"}
{"time":1577836799,"iso":"2019-12-31T23:59:59.000Z"}
```

Selecting all entries from May the 4th from the same file (602MB) takes 14 seconds:

```bash
$ pf "({time}) => time >= 1556928000 && time <= 1557014399" -a filter < 2019.jsonl > out.jsonl

{"time":1556928000}
{"time":1556928001}
...
{"time":1557014398}
{"time":1557014399}
```

### Example: Way to go Anakin!

Select the name, height, and mass of the first ten Star Wars characters:

```json
$ curl -s "https://swapi.co/api/people/" |
  pf "json => json.results" -l jsonObj -a flatMap -K '["name","height","mass"]'

{"name":"Luke Skywalker","height":"172","mass":"77"}
{"name":"C-3PO","height":"167","mass":"75"}
{"name":"R2-D2","height":"96","mass":"32"}
{"name":"Darth Vader","height":"202","mass":"136"}
{"name":"Leia Organa","height":"150","mass":"49"}
{"name":"Owen Lars","height":"178","mass":"120"}
{"name":"Beru Whitesun lars","height":"165","mass":"75"}
{"name":"R5-D4","height":"97","mass":"32"}
{"name":"Biggs Darklighter","height":"183","mass":"84"}
{"name":"Obi-Wan Kenobi","height":"182","mass":"77"}
```

Compute all character's [BMI][BMI]:

```json
$ curl -s "https://swapi.co/api/people/" |
  pf "json => json.results" -l jsonObj -a flatMap -K '["name","height","mass"]' |
  pf "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -K '["name","bmi"]'

{"name":"Luke Skywalker","bmi":26.027582477014604}
{"name":"C-3PO","bmi":26.89232313815483}
{"name":"R2-D2","bmi":34.72222222222222}
{"name":"Darth Vader","bmi":33.33006567983531}
{"name":"Leia Organa","bmi":21.77777777777778}
{"name":"Owen Lars","bmi":37.87400580734756}
{"name":"Beru Whitesun lars","bmi":27.548209366391188}
{"name":"R5-D4","bmi":34.009990434690195}
{"name":"Biggs Darklighter","bmi":25.082863029651524}
{"name":"Obi-Wan Kenobi","bmi":23.24598478444632}
```

Select only obese Star Wars characters:

```json
$ curl -s "https://swapi.co/api/people/" |
  pf "json => json.results" -l jsonObj -a flatMap -K '["name","height","mass"]' |
  pf "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -K '["name","bmi"]' |
  pf "ch => ch.bmi >= 30" -a filter -K '["name"]'

{"name":"R2-D2"}
{"name":"Darth Vader"}
{"name":"Owen Lars"}
{"name":"R5-D4"}
```

Turns out, Anakin could use some training!

## `id` Plugin

`pf` includes the `id` plugin that comes with the following extensions:

|                  | Description                                                                |
|------------------|----------------------------------------------------------------------------|
| `id` lexer       | Returns each chunk as a token.                                             |
| `id` parser      | Returns all tokens unchanged.                                              |
| `id` applicator  | Does not apply any functions and returns the JSON objects unchanged.       |
| `id` marshaller  | Applies Object.prototype.toString to the input and joins without newlines. |

## Comparison to Related Tools

|                       | `pf`                                                          | [`jq`][jq]                                     | [`fx`][fx]                                      | [`pandoc`][pandoc]                         |
|-----------------------|---------------------------------------------------------------|------------------------------------------------|-------------------------------------------------|--------------------------------------------|
| **Self-description**  | *Fast and extensible command-line data processor*             | *Command-line JSON processor*                  | *Command-line tool and terminal JSON viewer*    | *Universal markup converter*               |
| **Focus**             | Transforming data with user provided functions                | Transforming JSON with user provided functions | Transforming JSON with user provided functions  | Converting one markup format into another  |
| **License**           | [MIT][license]                                                | [MIT][jq-license]                              | [MIT][fx-license]                               | [GPL-2.0-only][pandoc-license]             |
| **Performance**       | (performance is given relative to `pf`)                       | `jq` is [>2x slower](#performance) than `pf`   | `fx` is [>10x slower](#performance) than `pf`   | ???                                        |
| **Extensibility**     | Third party plugins, any JavaScript library, custom functions | ???                                            | Any JavaScript library, custom functions        | ???                                        |
| **Processing DSL**    | Vanilla JavaScript and all JavaScript libraries               | [jq language][jq-lang]                         | Vanilla JavaScript and all JavaScript libraries | [Any programming language][pandoc-filters] |

## Reporting Issues

Please report issues [in the tracker][issues]!

## License

`pf` is [MIT licensed][license].

[actions]: https://github.com/Yord/pf/actions
[BMI]: https://en.wikipedia.org/wiki/Body_mass_index
[contribute]: https://github.com/Yord/pf
[fx]: https://github.com/antonmedv/fx
[fx-license]: https://github.com/antonmedv/fx/blob/master/LICENSE
[issues]: https://github.com/Yord/pf/issues
[jq]: https://github.com/stedolan/jq
[jq-lang]: https://github.com/stedolan/jq/wiki/jq-Language-Description
[jq-license]: https://github.com/stedolan/jq/blob/master/COPYING
[license]: https://github.com/Yord/pf/blob/master/LICENSE
[lodash]: https://lodash.com/
[node]: https://nodejs.org/
[npm]: https://docs.npmjs.com/downloading-and-installing-packages-globally
[npm-package]: https://www.npmjs.com/package/@pfx/pf
[pandoc]: https://pandoc.org
[pandoc-filters]: https://github.com/jgm/pandoc/wiki/Pandoc-Filters
[pandoc-license]: https://github.com/jgm/pandoc/blob/master/COPYRIGHT
[pf-sandbox]: https://github.com/Yord/pf-sandbox
[pfx-base]: https://github.com/Yord/pfx-base
[pfx-dsv]: https://github.com/Yord/pfx-dsv
[pfx-id]: https://github.com/Yord/pf/tree/master/src/plugins/id
[pfx-json]: https://github.com/Yord/pfx-json
[pfx-pfrc]: https://github.com/Yord/pfx-pfrc
[pfx-sample]: https://github.com/Yord/pfx-sample
[ramda]: https://ramdajs.com/
[shield-license]: https://img.shields.io/npm/l/@pfx/pf?color=yellow&labelColor=313A42
[shield-node]: https://img.shields.io/node/v/@pfx/pf?color=red&labelColor=313A42
[shield-npm]: https://img.shields.io/npm/v/@pfx/pf.svg?color=orange&labelColor=313A42
[shield-prs]: https://img.shields.io/badge/PRs-welcome-green.svg?labelColor=313A42
[shield-unit-tests-linux]: https://github.com/Yord/pf/workflows/linux/badge.svg?branch=master
[shield-unit-tests-macos]: https://github.com/Yord/pf/workflows/macos/badge.svg?branch=master
[shield-unit-tests-windows]: https://github.com/Yord/pf/workflows/windows/badge.svg?branch=master
[teaser]: ./teaser.gif