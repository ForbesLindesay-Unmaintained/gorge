'use strict'

var throat = require('throat')
var pending = { then: function () {} }

module.exports = gorge
function gorge(fn) {
  var latest = null
  var lock = throat(1)
  return function () {
    var self = this
    var args = arguments
    var current = (latest = {})
    return lock(function () {
      if (current === latest) return fn.apply(self, args)
      else return null
    })
    .then(function (res) {
      if (current === latest) return res
      else return pending
    }, function (err) {
      if (current === latest) throw err
      else return pending
    })
  }
}