var timespan = require('timespan')
  , S = require('string')
  , util = require('util')

function Situation (outStream) {
  this.outStream = outStream || process.stdout
  this.vars = []
  this.displayVars = {startTime: 'Start Time', runTime: 'Run Time'}
  this.eval = null
  this.startTime = null
  this.outputJSON = false

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

Situation.prototype.watch = function(variable, display) {
  this.vars.push(variable)
  if (display) this.displayVars[variable] = display

  return this
}

Situation.prototype.update = function() {
  var uobj = {}
  var _this = this

  if (!this.startTime)
    this.startTime = new Date()
  
  uobj['startTime'] = this.startTime.toISOString()
  //console.dir(timespan)
  //process.exit()
  var ts = timespan.fromDates(this.startTime, new Date())
  var runtime = util.inspect("%d:%d:%d-%d", ts.hours, ts.minutes, ts.seconds, ts.milliseconds)
  uobj['runTime'] = runtime

  this.vars.forEach(function(val) {
    uobj[val] = _this.eval['key' + val]()
  })

  var output = formatOutput.call(this, uobj)
  this.outStream.write(output)
}

Situation.prototype.start = function(updateIntervalMillis) {
  this.startTime = new Date()

  if (updateIntervalMillis) setInterval(this.update, updateIntervalMillis)
}

module.exports = function(outStream) {
  return new Situation(outStream)
}

function formatOutput (dataObj) {
  var _this = this
    , maxLeftLen = -1
    , maxRightLen = -1

  if (this.outputJSON) {
    return JSON.stringify(dataObj, null, 2)
  } else {
    var displayBody = []
    var keys = Object.keys(dataObj)

    //calc lengths and display keys
    keys.forEach(function(key, i) {
      var displayKey = _this.displayVars[key] || key
      maxLeftLen = displayKey.length > maxLeftLen ? displayKey.length : maxLeftLen

      var val = dataObj[key]
      maxRightLen = val.length > maxRightLen ? val.length : maxRightLen 
    })

    var totalLen = 2 + maxLeftLen + 2 + maxRightLen + 2
    var frameLine = S('*').times(totalLen).s
    var buff = ''
    keys.forEach(function(key) {
      var displayKey = _this.displayVars[key] || key
        , val = dataObj[key]

      buff += '* ' + S(displayKey).padLeft(maxLeftLen).s + ': ' + S(val).padRight(maxRightLen) + ' *\n'
    })

    return frameLine + buff + frameLine
  }
}

