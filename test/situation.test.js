var testutil = require('testutil')
  , situation = require('../lib/situation')

var GLOBAL = -5

describe('situation', function() {
  describe('- update', function() {
    describe('> when single variable is passed into watch and json true', function() {
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
        s1.shouldOutputJSON = true
        s1.eval = eval(s1.evalString)

        setInterval(function() {
          monitor += 3
          obj.cats += 1
        }, 10)

        setTimeout(function() {
          s1.update()
        }, 100)
      })
    })

    describe('> when two are are passed into watch, second is string', function() {
      it('should write the update text string to a stream', function(done) {
        var monitor = 0
          , obj = {cats: 4}

        var fauxStream = {
          write: function(data) {
            T (data.indexOf('Monitor: 27') > 0)
            T (data.indexOf('Cats: 13') > 0)
            done()
          }
        }

        var s1 = situation(fauxStream).watch('Monitor', 'monitor').watch('Cats', 'obj.cats')
        s1.eval = eval(s1.evalString)

        setInterval(function() {
          monitor += 3
          obj.cats += 1
        }, 10)

        setTimeout(function() {
          s1.update()
        }, 100)
      })
    })

    describe('> when two are are passed into watch, second is function', function() {
      it('should write the update text string to a stream', function(done) {
        var dogs = 0
          , obj = {cats: 4}

        var fauxStream = {
          write: function(data) {
            T (data.indexOf('dogs: 27') > 0)
            T (data.indexOf('Cats: 13') > 0)
            T (data.indexOf('Animals: 40') > 0)
            done()
          }
        }

        var s1 = situation(fauxStream).watch('dogs').watch('Cats', 'obj.cats').watch('Animals', function(){ return dogs + obj.cats})
        s1.eval = eval(s1.evalString)

        setInterval(function() {
          dogs += 3
          obj.cats += 1
        }, 10)

        setTimeout(function() {
          s1.update()
        }, 100)
      })
    })
  })
})

