'use strict'

var assert = require('assert')
var test = require('testit')
var Promise = require('promise')
var gorge = require('./')

function delay(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout)
  })
}

test('it returns a function which gets run', function () {
  var runs = []
  var fn = gorge(function () {
    var self = this
    var args = arguments
    return new Promise(function (resolve, reject) {
      runs.push({
        self: self,
        args: args,
        resolve: resolve,
        reject: reject
      })
    })
  })
  function alwaysPending(v) {
    return v.done(function () {
      throw new Error('This promise should have always been pending')
    })
  }

  alwaysPending(fn(1))
  alwaysPending(fn(2))
  alwaysPending(fn(3))

  var last = fn(4)
  assert(runs.length === 1)
  assert(runs[0].args[0] === 1)
  runs[0].resolve(null)
  return delay(50).then(function () {
    assert(runs.length === 2)
    assert(runs[1].args[0] === 4)
    runs[1].resolve('result')
    return last
  }).then(function (result) {
    assert(result === 'result')
    var next = fn(5)
    assert(runs.length === 3)
    assert(runs[2].args[0] === 5)
    runs[2].resolve('result2')
    return next
  }).then(function (result) {
    assert(result === 'result2')
  })
})