const url = require('url')
const pull = require('pull-stream')
const methods = ['OPTIONS', 'GET', 'POST', 'PUT', 'UPDATE', 'DELETE', 'TRACE', 'CONNECT', 'PATCH']

// Minimal express-like router for pull-streams
function PullHttpRouter (router, opts) {
  opts = opts || {}
  this._router = router || require('routington')()
  this.match = opts.match || defaultMatchWrapper
  this.define = opts.define || defaultDefineWrapper

  function defaultMatchWrapper (route) {
    return this._router.match(route)
  }

  function defaultDefineWrapper (route) {
    return this._router.define(route)[0]
  }
}

module.exports = PullHttpRouter

PullHttpRouter.prototype.route = function provideRouter (opts) {
  opts = opts || {}

  function pullRoute (request) {
    var match = this.match(url.parse(request.url).pathname)
    var readables

    if (!match) {
      throw new Error('No route matched.')
    }

    readables = match.node[request.method]

    return pull.apply(this, readables)
  }

  return pull(pull.map(pullRoute.bind(this)), pull.flatten())
}

function validateParameters (path, readables) {
  if (typeof path !== 'string') {
    if (arguments.length > 1) {
      readables = Array.prototype.slice(arguments)
    } else {
      readables = path
    }

    path = '*'
  } else {
    if (arguments.length > 2) {
      readables = Array.prototype.slice.call(arguments, 1)
    }
  }

  if (!(readables instanceof Array)) {
    readables = [readables]
  }

  return {
    path: path,
    readables: readables
  }
}

methods.map(function attachMethods (method) {
  PullHttpRouter.prototype[method.toLowerCase()] = function attachPath (path, readables) {
    var options = validateParameters.apply(this, arguments)
    var node = this.define(options.path)
    node[method] = options.readables
  }
})
