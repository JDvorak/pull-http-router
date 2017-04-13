const test = require('tape')
const pull = require('pull-stream')
const HttpRouter = require('./index')

test('should provide methods for all http verbs', function (t) {
  var router = new HttpRouter()
  t.ok(router.get != null, 'Provides get method')
  t.ok(router.delete != null, 'Provides delete method')
  t.ok(router.put != null, 'Provides put method')
  t.ok(router.post != null, 'Provides post method')
  t.ok(router.update != null, 'Provides update method')
  t.ok(router.options != null, 'Provides options method')
  t.ok(router.connect != null, 'Provides connect method')
  t.ok(router.patch != null, 'Provides patchmethod')
  t.end()
})

test('should route requests', function (t) {
  t.plan(1)
  var router = new HttpRouter()

  router.get('/', pull.count(0))
  router.get('/test10', pull.count(10)) // TARGET

  var last
  pull(
    pull.values([{url: 'http://blah.blah.com/test10', method: 'GET'}]),
    router.route(),
    pull.drain(function (ea) {
      last = ea
    }, function () {
      t.ok(last === 10, 'Retrieve the correct pull stream by route.')
      t.end()
    })
  )
})

test('should differentiate handlers by method', function (t) {
  t.plan(1)
  var router = new HttpRouter()

  router.get('/', pull.count(0))
  router.get('/test20', pull.count(10))
  router.post('/test20', pull.count(20))  // TARGET

  var last

  pull(
    pull.values([{url: 'http://www.anothertest.com/test20', method: 'POST'}]),
    router.route(),
    pull.drain(function (ea) {
      last = ea
    }, function () {
      t.ok(last === 20, 'Retrieve the correct pull stream by route.')
      t.end()
    })
    )
})

test('should handle both throughs and sources as handlers', function (t) {
  t.plan(2)
  var router = new HttpRouter()

  router.get('/through', pull.map(function () { return 'yes' }))
  router.get('/source', pull.values(['yes']))

  var last

  pull(
    pull.values([{url: 'http://www.anothertest.com/through', method: 'GET'}]),
    router.route(),
    pull.drain(function (ea) {
      last = ea
    }, function () {
      t.ok(last === 'yes', 'Handle through streams as handlers fine.')
      pull(
        pull.values([{url: 'http://www.anothertest.com/source', method: 'GET'}]),
        router.route(),
        pull.drain(function (ea) {
          t.ok(ea === 'yes', 'Handle sources as handlers too')
        }, function () {
          t.end()
        })
      )
    })
    )
})

test('should handle both throughs and sources as handlers even when nested', function (t) {
  t.plan(4)
  var router = new HttpRouter()

  router.get('/through', pull.map(function () { return pull(pull.values([0]), pull.map(function () { return pull(pull.values([0]), pull.map(function () { return 'yes' })) })) }))
  router.get('/source', pull.map(function () { return pull(pull.values(['yes'])) }))

  var last
  var i = 0

  pull(
    pull.values([{url: 'http://www.anothertest.com/through', method: 'GET'}]),
    router.route(),
    pull.drain(function (ea) {
      i++
      last = ea
    }, function () {
      t.ok(i === 1, 'Does not duplicate events')
      i = 0
      t.ok(last === 'yes', 'Handle through streams as handlers fine.')
      pull(
        pull.values([{url: 'http://www.anothertest.com/source', method: 'GET'}]),
        router.route(),
        pull.drain(function (ea) {
          i++
          t.ok(i === 1, 'Does not duplicate events')
          t.ok(ea === 'yes', 'Handle sources as handlers too')
        }, function () {
          t.end()
        })
      )
    })
    )
})
