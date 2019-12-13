![pf teaser][teaser]

`pf` (parser functions) is a fast and extensible command-line data (e.g. JSON) processor similar to `jq` and `fx`.

[![npm version][npm-shield]][npm-package]
[![license][license-shield]][license]
[![unit tests status][unit-tests-shield]][actions]
[![PRs Welcome][prs-shield]][pfx-how-to-contribute]

## Installation

`pf` requires **Node.js v8.3.0** or higher.

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

`pf` also works on JSON streams:

```json
$ curl -s "https://swapi.co/api/films/" |
  pf "json => json.results" -l jsonStream -a flatMap -s '["episode_id","title"]' |
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

|                               | Lexers       | Parsers                  | Applicators                      | Marshallers      | `pf` |
|-------------------------------|--------------|--------------------------|----------------------------------|------------------|:----:|
| [`@pfx/base`][pfx-base]       | `id`, `line` | `id`                     | `map`, `flatMap`, `filter`, `id` | `toString`, `id` |   ✓  |
| [`@pfx/json`][pfx-json]       | `jsonStream` | `jsonSingle`, `jsonBulk` |                                  | `jsonStringify`  |   ✓  |
| [`@pfx/csv`][pfx-csv]         | ???          | ???                      | ???                              | ???              |   ✕  |
| [`@pfx/xml`][pfx-xml]         | ???          | ???                      | ???                              | ???              |   ✕  |
| [`@pfx/geojson`][pfx-geojson] | ???          | ???                      | ???                              | `geojson`        |   ✕  |
| [`@pfx/sample`][pfx-sample]   | `sample`     | `sample`                 | `sample`                         | `sample`         |   ✕  |

The last column states which plugins come preinstalled in `pf`.
Refer to the `.pfrc` Module section to see how to enable more plugins.

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
  func: (verbose, failEarly, argv) => (data, prevLines) => (
    {err: '', tokens: [data], lines: [], lastLine: -1, rest: ''}
  )
}

const sampleParser = {
  name: 'sample',
  desc: 'is a sample parser.',
  func: (verbose, failEarly, argv) => (tokens, lines) => (
    {err: '', jsons: tokens}
  )
}

const sampleApplicator = {
  name: 'sample',
  desc: 'is a sample applicator.',
  func: (verbose, failEarly, fs, argv) => (jsons, lines) => (
    {err: '', jsons: jsons}
  )
}

const sampleMarshaller = {
  name: 'sample',
  desc: 'is a sample marshaller.',
  func: (verbose, failEarly, argv) => jsons => (
    {err: '', str: jsons.map(json => json.toString()).join('')}
  )
}
```

The `name` is used by `pf` to select your extension,
the `desc` is displayed in the options section of `pf --help`, and
the `func` is called by `pf` to transform data.

The sample extensions are bundled to the sample plugin, as follows:

```js
const samplePlugin = {
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
const samplePlugin = require('@pfx/sample')
```

Regardless of whether a plugin was defined by a user or installed from `npm`,
all plugins are added to the `.pfrc` module the same way:

```js
module.exports = {
  plugins:  [samplePlugin],
  context:  {},
  defaults: {}
}
```

`pf --help` should now list the sample plugin extensions in the options section.

> :speak_no_evil: Adding third party plugins may **break the `pf` command line tool**! Use this feature responsibly.

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
    marshaller: 'sample'
  }
}
```

> :see_no_evil: Defaults are assigned **globally** and changing them may **break existing `pf` scripts**! Use this feature responsibly.

## Usage

Selecting all Unix timestamps from a file containing all seconds of 2019 (602 MB, 31536000 lines) in JSON format (e.g. `{"time":1546300800}`) takes ~18 seconds (macOS 10.15, 2.8 GHz i7 processor):

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
  pf "json => json.results" -l jsonStream -a flatMap -s '["name","height","mass"]'

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
  pf "json => json.results" -l jsonStream -a flatMap -s '["name","height","mass"]' |
  pf "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -s '["name","bmi"]'

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
  pf "json => json.results" -l jsonStream -a flatMap -s '["name","height","mass"]' |
  pf "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -s '["name","bmi"]' |
  pf "ch => ch.bmi >= 30" -a filter -s '["name"]'

{"name":"R2-D2"}
{"name":"Darth Vader"}
{"name":"Owen Lars"}
{"name":"R5-D4"}
```

Turns out, Anakin could use some training!

## Related

+   [`jq`][jq]: Command-line JSON processor.
+   [`fx`][fx]: Command-line tool and terminal JSON viewer.

## License

`pf` is [MIT licensed][license].

[npm-package]: https://www.npmjs.com/package/@pfx/pf
[teaser]: ./teaser.gif
[npm]: https://docs.npmjs.com/downloading-and-installing-packages-globally
[BMI]: https://en.wikipedia.org/wiki/Body_mass_index
[fx]: https://github.com/antonmedv/fx
[jq]: https://github.com/stedolan/jq
[pfx-base]: https://github.com/Yord/pfx-base
[pfx-json]: https://github.com/Yord/pfx-json
[pfx-csv]: https://github.com/Yord/pf
[pfx-xml]: https://github.com/Yord/pf
[pfx-geojson]: https://github.com/Yord/pf
[pfx-sample]: https://github.com/Yord/pfx-sample
[pfx-how-to-contribute]: https://github.com/Yord/pf
[pfx-pfrc]: https://github.com/Yord/pfx-pfrc
[ramda]: https://ramdajs.com/
[lodash]: https://lodash.com/
[license]: https://github.com/Yord/pf/blob/master/LICENSE
[actions]: https://github.com/Yord/pf/actions
[npm-shield]: https://img.shields.io/npm/v/@pfx/pf.svg?color=orange
[license-shield]: https://img.shields.io/badge/license-MIT-blue.svg?color=green
[unit-tests-shield]: https://github.com/Yord/pf/workflows/unit%20tests/badge.svg?branch=master
[prs-shield]: https://img.shields.io/badge/PRs-welcome-yellow.svg