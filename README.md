# pull-http-router [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Minimal express-like router for pull-streams.

## Usage
```js
const pl = require('pull-level')
const summary = require('server-summary')
const toPull = require('stream-to-pull-stream')
const http = require('http')

var router = new PullHttpRouter()

router.post('/api/messages', pl.write(db), setStatus(200))
router.get('/api/messages', [
  pull.map(function readDB (request) {
    return pull(
      pl.read(db, {min: request.query.offset}),
      offsetLimit(null, request.query.limit)
    )
  }),
  pull.flatten(),
  setHeaders,
  setStatus(200)
])

var server = http.createServer(function (req, res) {
  pull(
    parseHeaders,
    parseQueryStrings,
    router.route(),
    toPull(res)
  )
})

server.listen(1337, summary(server))
```

## API
### PullHttpRouter

Usage: `router = new PullHttpRouter(opts)`

Create a new PullHttpRouter.

Accepts an options object with the following optional keys:
- __router:__  Accepts any router object with a match and define method. Defaults to [routington][routington]
- __match:__ Specify a specific match method for matching routes. Defaults to [routington][routington]#match
- __define:__ Specify a specific define method for defining routes. Defaults to [routington][routington]#define

### router#route

Usage: `router.route(opts)`

Create a pull-stream which expects a request object, and returns a readable stream.

### pullHttpRouter#get, pullHttpRouter#set, pullHttpRouter#update, pullHttpRouter#post, pullHttpRouter#put, pullHttpRouter#delete, pullHttpRouter#options

Usage: `router.get(path, [streams...])`

Accepts a path to match on, and a stream to stream to. If multiple pull-streams are provided they will be linked together as if they were passed to pull-stream core's `pull()` 


## Installation
```sh
$ npm install pull-http-router
```

## License
[MIT](https://tldrlegal.com/license/mit-license)

[routington]: https://github.com/pillarjs/routington
[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/pull-http-router.svg?style=flat-square
[3]: https://npmjs.org/package/pull-http-router
[4]: https://img.shields.io/travis/JDvorak/pull-http-router/master.svg?style=flat-square
[5]: https://travis-ci.org/JDvorak/pull-http-router
[6]: https://img.shields.io/codecov/c/github/JDvorak/pull-http-router/master.svg?style=flat-square
[7]: https://codecov.io/github/JDvorak/pull-http-router
[8]: http://img.shields.io/npm/dm/pull-http-router.svg?style=flat-square
[9]: https://npmjs.org/package/pull-http-router
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
