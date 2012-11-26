

function Situation (outStream) {
  this.outStream = outStream || process.stdout
  this.vars = []
  this.watch = null

  this.__defineGetter__('watchString', function() {
    var s = '(function() { return { \n'
    this.vars.forEach(function(key) {
      var fns = '  "key' + key + '": function() { return ' + key + '; },\n'
      s += fns
    })
    s = s.substring(0, s.length - 2) //chop last ',\n'
    s += ' } } )()'
    return s
  })
}

Situation.prototype.add = function(variable) {
  this.vars.push(variable)
  return this
}

Situation.prototype.update = function() {
  var uobj = {}
  var _this = this
  this.vars.forEach(function(val) {
    uobj[val] = _this.watch['key' + val]()
  })

  this.outStream.write(JSON.stringify(uobj, null, 2))
}

module.exports = function(outStream) {
  return new Situation(outStream)
}