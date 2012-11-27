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

      var s1 = situation(fauxStream).watch('monitor').watch('GLOBAL').watch('obj.cats')
      s1.outputJSON = true
      s1.eval = eval(s1.watchString)

      setInterval(function() {
        monitor += 3
        obj.cats += 1
      }, 10)

      setTimeout(function() {
        s1.update()
      }, 100)
    })
  })
})

