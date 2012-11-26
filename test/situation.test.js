var testutil = require('testutil')
  , situation = require('../lib/situation')

var GLOBAL = -5

describe('situation', function() {
  describe('- update', function() {
    it('should write the update JSON string to a stream', function(done) {
      var monitor = 0
        , obj = {cats: 4}

      var fauxStream = {
        write: function(data) {
          var data = JSON.parse(data)
          T (data.monitor === 27)
          T (data.GLOBAL === -5)
          T (data['obj.cats'] === 13)
          done()
        }
      }

      var something = situation(fauxStream)
      something.add('monitor')
      something.add('GLOBAL')
      something.add('obj.cats')
      something.watch = eval(something.watchString)

      setInterval(function() {
        monitor += 3
        obj.cats += 1
      }, 10)

      setTimeout(function() {
        something.update()
      }, 100)
    })
  })
})

