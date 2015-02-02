!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.tweenState=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var easingTypes = {
  // t: current time, b: beginning value, c: change in value, d: duration

  // new note: I much prefer specifying the final value rather than the change
  // in value this is what the repo's interpolation plugin api will use. Here,
  // c will stand for final value

  linear: function(t, b, _c, d) {
    var c = _c - b;
    return t*c/d + b;
  },
  easeInQuad: function (t, b, _c, d) {
    var c = _c - b;
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (t, b, _c, d) {
    var c = _c - b;
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (t, b, _c, d) {
    var c = _c - b;
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (t, b, _c, d, s) {
    var c = _c - b;
    if (s == undefined) s = 1.70158;
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (t, b, _c, d) {
    var c = _c - b;
    return c - easingTypes.easeOutBounce (d-t, 0, c, d) + b;
  },
  easeOutBounce: function (t, b, _c, d) {
    var c = _c - b;
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (t, b, _c, d) {
    var c = _c - b;
    if (t < d/2) return easingTypes.easeInBounce (t*2, 0, c, d) * .5 + b;
    return easingTypes.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
};

module.exports = easingTypes;

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

},{}],2:[function(require,module,exports){
'use strict';

var easingTypes = require('./easingTypes');

// additive is the new iOS 8 default. In most cases it simulates a physics-
// looking overshoot behavior (especially with easeInOut. You can test that in
// the example
var DEFAULT_STACK_BEHAVIOR = 'ADDITIVE';
var DEFAULT_EASING = easingTypes.easeInOutQuad;
var DEFAULT_DURATION = 300;
var DEFAULT_DELAY = 0;

function shallowClone(obj) {
  var ret = {};
  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    ret[key] = obj[key];
  }
  return ret;
}

// see usage below
function returnState(state) {
  return state;
}

var tweenState = {
  easingTypes: easingTypes,
  stackBehavior: {
    ADDITIVE: 'ADDITIVE',
    DESTRUCTIVE: 'DESTRUCTIVE',
  }
};

tweenState.Mixin = {
  getInitialState: function() {
    return {
      tweenQueue: [],
    };
  },

  tweenState: function(a, b, c) {
    // tweenState(stateNameString, config)
    // tweenState(stateRefFunc, stateNameString, config)

    // passing a state name string and retrieving it later from this.state
    // doesn't work for values in deeply nested collections (unless you design
    // the API to be able to parse 'this.state.my.nested[1]', meh). Passing a
    // direct, resolved reference wouldn't work either, since that reference
    // points to the old state rather than the subsequent new ones.
    if (typeof a === 'string') {
      c = b;
      b = a;
      a = returnState;
    }
    this._tweenState(a, b, c);
  },

  _tweenState: function(stateRefFunc, stateName, config) {
    config = shallowClone(config);

    var state = this._pendingState || this.state;
    var stateRef = stateRefFunc(state);

    // see the reasoning for these defaults at the top
    config.stackBehavior = config.stackBehavior || DEFAULT_STACK_BEHAVIOR;
    config.easing = config.easing || DEFAULT_EASING;
    config.duration = config.duration == null ? DEFAULT_DURATION : config.duration;
    config.beginValue = config.beginValue == null ? stateRef[stateName] : config.beginValue;
    config.delay = config.delay == null ? DEFAULT_DELAY : config.delay;

    var newTweenQueue = state.tweenQueue;
    if (config.stackBehavior === tweenState.stackBehavior.DESTRUCTIVE) {
      newTweenQueue = state.tweenQueue.filter(function(item) {
        return item.stateName !== stateName || item.stateRefFunc(state) !== stateRef;
      });
    }

    newTweenQueue.push({
      stateRefFunc: stateRefFunc,
      stateName: stateName,
      config: config,
      initTime: Date.now() + config.delay,
    });

    // tweenState calls setState
    // sorry for mutating. No idea where in the state the value is
    stateRef[stateName] = config.endValue;
    // this will also include the above update
    this.setState({tweenQueue: newTweenQueue});

    if (newTweenQueue.length === 1) {
      this.startRaf();
    }
  },

  getTweeningValue: function(a, b) {
    // see tweenState API
    if (typeof a === 'string') {
      b = a;
      a = returnState;
    }
    return this._getTweeningValue(a, b);
  },

  _getTweeningValue: function(stateRefFunc, stateName) {
    var state = this.state;
    var stateRef = stateRefFunc(state);
    var tweeningValue = stateRef[stateName];
    var now = Date.now();

    for (var i = 0; i < state.tweenQueue.length; i++) {
      var item = state.tweenQueue[i];
      var itemStateRef = item.stateRefFunc(state);
      if (item.stateName !== stateName || itemStateRef !== stateRef) {
        continue;
      }

      var progressTime = now - item.initTime > item.config.duration ?
        item.config.duration :
        Math.max(0, now - item.initTime);
      // `now - item.initTime` can be negative if initTime is scheduled in the
      // future by a delay. In this case we take 0

      var contrib = -item.config.endValue + item.config.easing(
        progressTime,
        item.config.beginValue,
        item.config.endValue,
        item.config.duration
        // TODO: some funcs accept a 5th param
      );
      tweeningValue += contrib;
    }

    return tweeningValue;
  },

  _rafCb: function() {
    if (!this.isMounted()) {
      return;
    }

    var state = this.state;
    if (state.tweenQueue.length === 0) {
      return;
    }

    var now = Date.now();
    state.tweenQueue.forEach(function(item) {
      if (now - item.initTime >= item.config.duration) {
        item.config.onEnd && item.config.onEnd();
      }
    });

    var newTweenQueue = state.tweenQueue.filter(function(item) {
      return now - item.initTime < item.config.duration;
    });

    this.setState({
      tweenQueue: newTweenQueue,
    });

    requestAnimationFrame(this._rafCb);
  },

  startRaf: function() {
    requestAnimationFrame(this._rafCb);
  },

};

module.exports = tweenState;

},{"./easingTypes":1}]},{},[2])(2)
});