// Smoke test: start the ratings server (v1, in-memory) and check that
// /health and /ratings/<id> respond.

var assert = require('assert')
var http = require('http')
var path = require('path')
var spawn = require('child_process').spawn

var port = 20000 + (process.pid % 10000)
var server = spawn(process.execPath, [path.join(__dirname, 'ratings.js'), String(port)], {stdio: 'inherit'})

function get (urlPath) {
  return new Promise(function (resolve, reject) {
    http.get({host: '127.0.0.1', port: port, path: urlPath}, function (res) {
      var body = ''
      res.on('data', function (chunk) { body += chunk })
      res.on('end', function () { resolve({status: res.statusCode, body: body}) })
    }).on('error', reject)
  })
}

async function waitForServer () {
  for (var i = 0; i < 50; i++) {
    try {
      return await get('/health')
    } catch (err) {
      await new Promise(function (resolve) { setTimeout(resolve, 100) })
    }
  }
  throw new Error('ratings server did not start on port ' + port)
}

(async function () {
  try {
    var health = await waitForServer()
    assert.strictEqual(health.status, 200)

    var ratings = await get('/ratings/0')
    assert.strictEqual(ratings.status, 200)
    var body = JSON.parse(ratings.body)
    assert.strictEqual(body.id, 0)
    assert.ok(body.ratings, 'response has ratings')

    var bad = await get('/ratings/abc')
    assert.strictEqual(bad.status, 400)
    console.log('ratings smoke test passed')
  } finally {
    server.kill()
  }
})().catch(function (err) {
  console.error(err)
  process.exitCode = 1
})
