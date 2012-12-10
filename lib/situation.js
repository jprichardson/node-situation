var timespan = require('timespan')
  , S = require('string')
  , util = require('util')
  , ms = require('ms')

function Situation (outStream) {
  this.outStream = outStream || process.stdout
  this.vars = []
  this.funcs = {}
  this.displayVars = {startTime: 'Start Time', runTime: 'Run Time'}
  this.eval = null
  this.startTime = null
  this.shouldOutputJSON = false
  this.interval = null

  this.__defineGetter__('evalString', function() {
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

Situation.prototype.watch = function() {
  if (arguments.length === 1) {
    this.vars.push(arguments[0])
  } 
  else if (arguments.length === 2) {
    if (typeof arguments[1] === 'string') {
      this.displayVars[arguments[1]] = arguments[0]
      this.vars.push(arguments[1])
    } else if (typeof arguments[1] === 'function') {
      var name = S(arguments[0].toLowerCase()).slugify().s
      this.displayVars[name] = arguments[0]
      this.funcs[name] = arguments[1]
    }
  }
 
  return this
}

Situation.prototype.update = function() {
  var uobj = {}
  var _this = this

  if (!this.eval) {
    console.error("No situationObj.eval object. Did you forget to run eval(situationObj.evalString)?")
    return
  }

  if (!this.startTime)
    this.startTime = new Date()
  
  uobj['startTime'] = this.startTime.toISOString()
  var ts = timespan.fromDates(this.startTime, new Date())
  var runtime = util.format("%d:%d:%d", ts.hours, ts.minutes, ts.seconds)
  uobj['runTime'] = runtime

  this.vars.forEach(function(val) {
    uobj[val] = _this.eval['key' + val]() || 'undefined (typo?)'
  })

  Object.keys(this.funcs).forEach(function(key) {
    var func = _this.funcs[key]
    uobj[key] = func()
  })

  var output = formatOutput.call(this, uobj)
  this.outStream.write(output)
}

Situation.prototype.start = function(updateInterval) {
  var _this = this
    , updateIntervalMillis = null

  if (updateInterval) {
    if (typeof updateInterval === 'number')
      updateIntervalMillis = updateInterval
    else if (typeof updateInterval === 'string')
      updateIntervalMillis = ms(updateInterval)
  }

  this.startTime = new Date()

  if (updateIntervalMillis) 
    this.interval = setInterval(function() { _this.update() }, updateIntervalMillis)

  return this;
}

Situation.prototype.stop = function() {
  if (this.interval) {
    clearInterval(this.interval)
    this.interval = null
  }
}

module.exports = function(outStream) {
  return new Situation(outStream)
}

function formatOutput (dataObj) {
  var _this = this
    , maxLeftLen = -1
    , maxRightLen = -1

  if (this.shouldOutputJSON) {
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
    var frameLine = S('*').times(totalLen).s + '\n'
    var buff = ''
    keys.forEach(function(key) {
      var displayKey = _this.displayVars[key] || key
        , val = dataObj[key]

      buff += '* ' + S(displayKey).padLeft(maxLeftLen).s + ': ' + S(val).padRight(maxRightLen).s + ' *\n'
    })

    return "\n" + frameLine + buff + frameLine + "\n"
  }
}

