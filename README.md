# Parser Functions

Fast and extensible command-line data (e.g. JSON) processor and transformer.

+   **Easy to use**: Knowing JavaScript makes it even more simple.
+   **Blazing fast**: Faster than [`jq`][jq] and much faster than [`fx`][fx] when transforming json.
+   **Very convenient**: Use Lodash or any other library in your transformation function (see guide below).
+   **Highly extensible**: Trivial to add and use your own parsers, lexers or marshallers (see guide below).
+   **Streaming support**: Supports streaming JSON out of the box (through the `jsonStream` lexer).
+   **Very few dependencies**: Depends only on yargs.
+   **Concise code**: Only ??? lines of code.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Yord/pf/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/fx.svg)](https://www.npmjs.com/package/fx)

```bash
$ npm install --global pf
```

Selecting all Unix timestamps from a file containing all seconds of 2019 (602 MB, 31536000 lines) in JSON format (e.g. `{"time":1546300800}`) takes ~18 seconds (macOS 10.15, 2.8 GHz i7 processor):

```bash
$ pf -f "json => json.time" < 2019.jsonl > out.jsonl

1546300800
1546300801
...
1577836798
1577836799
```

[`jq`][jq] (version 1.6) takes ~46 seconds and is 2.5x slower:

```bash
$ jq '.time' < 2019.jsonl > out.jsonl
```

[`fx`][fx] (version 14.1.0) takes ~290 seconds and is 16x slower:

```bash
$ fx "json => json.time" < 2019.jsonl > out.jsonl
```

Printing the episode ids and names of all Star Wars movies:

```json
$ curl -s https://swapi.co/api/films/ |
  pf -l jsonStream -u flatMap -f "json => json.results" -r "['episode_id','title']" |
  sort

{"episode_id":1,"title":"The Phantom Menace"}
{"episode_id":2,"title":"Attack of the Clones"}
{"episode_id":3,"title":"Revenge of the Sith"}
{"episode_id":4,"title":"A New Hope"}
{"episode_id":5,"title":"The Empire Strikes Back"}
{"episode_id":6,"title":"Return of the Jedi"}
{"episode_id":7,"title":"The Force Awakens"}
```

See the example and performance sections below for more examples.

## Usage

The following command line options are most common. See `pf --help` for all options.

<dl>
  <dt><code>pf [-l|--lexer] STRING</code></dt>
  <dd>
    <p>Defines how the input is tokenized:</p>
    <ul>
      <li>
        <code>line</code> (<b>default</b>) treats lines as tokens.
      </li>
      <li>
        <code>jsonStream</code> parses streams of JSON objects (not arrays!) and drops all characters in between.
      </li>
    </ul>
    <p>If <code>--lexer</code> gets any other string, the global scope is searched for a matching variable or function.</p>
  </dd>
  <dt><code>pf [-p|--parser] STRING</code></dt>
  <dd>
    <p>Defines how tokens are parsed into JSON:</p>
    <ul>
      <li>
        <code>single</code> parses each token individually.
      </li>
      <li>
        <code>bulk</code> (<b>default</b>) parses all tokens in one go, which is faster, but fails the whole bulk instead of just a single token if an error is thrown.
      </li>
    </ul>
    <p>If <code>--parser</code> gets any other string, the global scope is searched for a matching variable or function.</p>
  </dd>
  <dt><code>pf [-f|--function] FUNCTION_STRING</code></dt>
  <dd>
    <p>Defines how JSON is transformed:</p>
    <ul>
      <li>
        <code>"json => json"</code> (<b>default</b>) If no function string is given, the identity function is used.
      </li>
      <li>
        <code>"json => ..."</code> All variables and functions in global scope may be used in the function.
      </li>
    </ul>
    <p>If you would like to use libraries like lodash or ramda, read the documentation on <code>.pfrc</code> below.</p>
  </dd>
  <dt><code>pf [-u|--updater] STRING</code></dt>
  <dd>
    <p>Defines how the the function f is applied to JSON:</p>
    <ul>
      <li>
        <code>map</code> (<b>default</b>) applies f to each parsed JSON element and replaces it with f's result.
      </li>
      <li>
        <code>flatMap</code> applies f to each element, but acts differently depending on f's result.
        <ul>
          <li><code>undefined</code>: return nothing.</li>
          <li><code>[...]</code>: return every array item individually or nothing for empty arrays.</li>
          <li>otherwise: act like map.</li>
        </ul>
      </li>
      <li>
        <code>filter</code> expects f to be a predicate and keeps all JSON elements for which f yields true.
      </li>
    </ul>
    <p>If <code>--updater</code> gets any other string, the global scope is searched for a matching variable or function.</p>
  </dd>
  <dt><code>pf [-m|--marshaller] STRING</code></dt>
  <dd>
    <p>Defines how the updated JSON is transformed back to a string:</p>
    <ul>
      <li>
        <code>stringify</code> (<b>default</b>) uses <code>JSON.stringify</code> and has the following additional options:
        <dl>
          <dt><code>[-s|--spaces]</code></dt>
          <dd>The number of spaces used to format JSON. If it is set to <code>0</code> (<b>default</b>), the JSON is printed in a single line.</dd>
          <dt><code>[-r|--replacer]</code></dt>
          <dd>Determines which JSON fields are kept. If it is set to <code>null</code> (<b>default</b>), all fields remain. See the documentation of <code>JSON.stringify</code> for details.</dd>
        </dl>
      </li>
    </ul>
    <p>If <code>--marshaller</code> gets any other string, the global scope is searched for a matching variable or function.</p>
  </dd>
</dl>

## Examples

Select the name, height, and mass of the first ten Star Wars characters:

```json
$ curl -s https://swapi.co/api/people/ |
  pf -l jsonStream -u flatMap -f "json => json.results" -r "['name','height','mass']"

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
$ curl -s https://swapi.co/api/people/ |
  pf -l jsonStream -u flatMap -f "json => json.results" -r "['name','height','mass']" |
  pf -f "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -r "['name','bmi']"

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
$ curl -s https://swapi.co/api/people/ |
  pf -l jsonStream -u flatMap -f "json => json.results" -r "['name','height','mass']" |
  pf -f "ch => (ch.bmi = ch.mass / (ch.height / 100) ** 2, ch)" -r "['name','bmi']" |
  pf -u filter -f "ch => ch.bmi >= 30" -r "['name']"

{"name":"R2-D2"}
{"name":"Darth Vader"}
{"name":"Owen Lars"}
{"name":"R5-D4"}
```

Turns out, Anakin could use some training!

## Performance

Transforming Unix timestamps to an ISO string in a file containing all seconds of 2019 (602 MB, 31536000 lines) in JSON format (`{"time":1546300800}`) takes ~42 seconds (macOS 10.15, 2.8 GHz i7 processor)

```json
$ pf -f "json => (json.iso = new Date(json.time * 1000).toISOString(), json)" < 2019.jsonl > out.jsonl

{"time":1546300800,"iso":"2019-01-01T00:00:00.000Z"}
{"time":1546300801,"iso":"2019-01-01T00:00:01.000Z"}
...
{"time":1577836798,"iso":"2019-12-31T23:59:58.000Z"}
{"time":1577836799,"iso":"2019-12-31T23:59:59.000Z"}
```

[`jq`][jq] takes ~164 seconds (4x slower):

```bash
$ jq -c '{time, iso: .time|todate}' < 2019.jsonl > out.jsonl
```

[`fx`][fx] takes ~463 seconds (11x slower):

```bash
$ fx "json => (json.iso = new Date(json.time * 1000).toISOString(), json)" < 2019.jsonl > out.jsonl
```

Selecting all entries from May the 4th from the same file (602MB) takes 14sec:

```bash
$ pf -u filter -f "({time}) => time >= 1556928000 && time <= 1557014399" < 2019.jsonl > out.jsonl
```

```json
{"time":1556928000}
{"time":1556928001}
...
{"time":1557014398}
{"time":1557014399}
```

[`jq`][jq] takes ~44 seconds (3x slower):

```bash
$ jq -c 'select(.time >= 1556928000 and .time <= 1557014399)' < 2019.jsonl > out.jsonl
```

[`fx`][fx] takes ~XYZ seconds (Xx slower):

```bash
$ fx ??? < 2019.jsonl > out.jsonl
```

## License

MIT

[BMI]: https://en.wikipedia.org/wiki/Body_mass_index
[fx]: https://github.com/antonmedv/fx
[jq]: https://github.com/stedolan/jq