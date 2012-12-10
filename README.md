Node.js - situation
================

Conveniently write status updates to a stream.


Why?
----

Constantly crafting status blocks in JavaScript intervals was a pain.



Installation
------------

    npm install situation



Example
------

Let's assume that you want to display the status of some variables every 2 seconds:

```javascript
var situation = require('situation')

var obj = {cats: 1}
  , dogs = 0

var s1 = situation()
  .watch('Cats', 'obj.cats')
  .watch('dogs')
  .watch('Animals', function(){ return obj.cats + dogs})
s1.eval = eval(s1.evalString)
s1.start('2 seconds')

//simulate change in variables
setInterval(function() {
  obj.cats += Math.floor((Math.random() * 5))
  connections += 1
},250)
```

the output is then displayed every on an interval:

```
*****************************************
*  Start Time: 2012-11-28T00:01:59.082Z *
*    Run Time: 0:0:15                   *
*        Cats: 125                      *
*        dogs: 63                       *
*     Animals: 188                      *
*****************************************
```


Members
-------

### situation(stream)

Creates a `situation` object. If no parameter is passed, `process.stdout` is the default stream.

Example:

```javascript
var situation = require('situation')

var s1 = situation()
assert(s1.outStream, process.stdout) //true
```


### watch([display], variableOrFunc)

Adds a variable to report the situation on. Must pass in as a string or a function. See the example.

Returns the `situation` object so that they can be chained.


### eval

Object that contains the variable functions. Must be used in conjunction with `evalString`.

Note: Any variables used, must be available in the context of the `eval` method called. That is, where
ever you call `eval(situationObj.evalString)` must have the variables in scope.

Example:

```javascript
var situation = require('situation')

var s1 = situation().watch('counter')
s1.eval = eval(s1.evalString) //this must be called!!
```

### evalString

See `eval`.


### shouldOutputJSON

Instead of writing the text status block to the stream, a JSON object is written to the stream. This may be useful if writing to a TCP stream.

Example: 

```javascript
var situation = require('situation')

var processing = 55

var s1 = situation(myServer)
s1.shouldOutputJSON = true

/*  
    write to myServer TCP every 5 seconds
    date:
    {
      "startTime": "2012-11-28T00:01:59.082Z",
      "runTime": "0:0:15",
      "processing": 55
    }
*/
s1.start(5000)
```  


### start([updateInterval])

Sets an internal interval so that the stream can be written to at a repeated rate. Can either 
be a `number` or a `string`. If it's a `number`, it's assumed to be in milliseconds. If it's
a string, it must be compatible with [ms](https://github.com/guille/ms.js). If no parameter is
passed the internal `startTime` will just be set, but no interval will run. You can then call
`update()` manually.


### stop()

If the internal update interval is running, this will stop it. This is equivalent to calling `clearInterval`, i.e. it'll remove 
it from the Node.js event run loop.


### update()

Force a manual write to the stream of the current variable situation.

Example:

```javascript
var situation = require('situation')

var processing = 55

var s1 = situation()
s1.start()

setInterval(function() {
  s1.update()
}, Math.floor(Math.random()*10000))

``` 





License
-------

(MIT License)

Copyright 2012, JP Richardson  <jprichardson@gmail.com>


