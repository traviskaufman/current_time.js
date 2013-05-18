/**
 * CurrentTime.js - A javascript module that will take care of all of your
 * current time needs.
 * @todo convert hours/minutes/seconds to 12 hour format
 * @todo jQuery Plugin
 * @todo DOCUMENT!!
 */
(function() {
  'use strict';

  var _hasProp = Object.prototype.hasOwnProperty;

  var _bind = function(fn, ctx) {
    return function() {
      return fn.apply(ctx, Array.prototype.slice.call(arguments));
    };
  };

  var _noop = function() {};

  var _getMeridian = function(rawHours) {
    return (rawHours < 12) ? "am" : "pm";
  };

  var _parseDate = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return {
      hours: _splitTime(hours),
      minutes: _splitTime(minutes),
      seconds: _splitTime(seconds),
      meridian: _getMeridian(hours)
    };
  };

  var _splitTime = function(time) {
    return {
      tens: _tens(time),
      ones: _ones(time),
      raw: time
    };
  };

  var _tens = function(num) {
    return parseInt(num * 0.1, 10);
  };

  var _ones = function(num) {
    return num % 10;
  };

  var _toZeroPaddedString = function(num) {
    return (num < 10) ? "0" + num : num.toString();
  };

  var _toTwelveHrFormat = function(hrs) {
    return ((hrs % 12) === 0) ? 12 : (hrs % 12);
  };

  var _currentTime = {}; // Filled on init().

  var _timeStringRegex = /%(h|H|g|G|m|s|a|A){1}/g;

  var CurrentTime = {
    /**
     * Initialization function. <strong>Should be called before using this
     * module.</strong> Also note that this function can only be called
     * once.
     *
     * @param {Object} opts Options to pass to the module.
     *    Current options are as follows:
     *    <ul>
     *      <li><strong>onUpdate</strong></li>: Callback that's invoked every
     *      time the current time is updated. It's receiver will always be
     *      the CurrentTime module, and the callback is passed 2 arguments:
     *      the current time object, and the raw date object that was used to
     *      update the current time. Note that this callback can be changed
     *      at any time by setting <code>CurrentTime.onUpdate</code>.
     *    </ul>
     */
    init: (function() {
      var called = false;
      return function(opts) {
        if (called) {
          return;
        }
        called = true;

        if (typeof opts.onUpdate === "function") {
          this.onUpdate = opts.onUpdate;
        }

        this.scheduleUpdates();
      };
    })(),

    /**
     * Callback to be invoked whenever the current time is updated.
     *
     * You can set this before calling init if you'd like, or just pass it in
     * as an option to init, or set it after calling init. It's flexible :)
     */
    onUpdate: _noop,

    update: function(date) {
      _currentTime = _parseDate(date);
      this.onUpdate.call(this, this.get(), date);
    },

    scheduleUpdates: function() {
      var date = new Date();
      this.update(date);
      // Dat accuracy
      setTimeout(this.scheduleUpdates, 1000 - date.getMilliseconds());
    },

    get: function() {
      return _currentTime;
    },

    mkString: function(str) {
      var _this = this;

      if (typeof str !== "string") {
        str = "%h:%m:%s %a";
      }

      return str.replace(_timeStringRegex, function(_, sym) {
        return _this.timeSymbolFns[sym].call(_this, _this.get());
      });
    },

    getMeridian: function() {
      return _getMeridian(_currentTime.hours.raw);
    },

    toString: function() {
      return this.mkString();
    },

    // The following 3 methods assume that 0 ≤ <code>num</code> ≤ 99.
    // They could be scaled with modulo but since this is a clock, where
    // we never have more than double-digits, it's a meaningless sacrifice
    // of efficiency.

    // Adapted from PHP's date formatting.
    timeSymbolFns: {
      h: function(time) {
        return _toTwelveHrFormat(time.hours.raw).toString();
      },

      H: function(time) {
        return time.hours.raw.toString();
      },

      g: function(time) {
        return _toZeroPaddedString(
          _toTwelveHrFormat(time.hours.raw)
        );
      },

      G: function(time) {
        return _toZeroPaddedString(time.hours.raw);
      },

      m: function(time) {
        return _toZeroPaddedString(time.minutes.raw);
      },

      s: function(time) {
        return _toZeroPaddedString(time.seconds.raw);
      },

      // We don't pass register a time argument here because we don't need to.
      a: function() {
        return this.getMeridian();
      },

      A: function() {
        return this.getMeridian().toUpperCase();
      }
    },

    addSymbol: function(sym, symFn) {
      var addedSym = null;

      if (typeof sym === "string" &&
          sym.length === 1 &&
          typeof symFn === "function") {

        this.timeSymbolFns[sym] = _bind(symFn, CurrentTime);
        addedSym = sym;
      }

      return addedSym;
    },

    addSymbols: function(symbolsObj) {
      var addedSyms = [];

      for (var sym in symbolsObj) {
        if (_hasProp.call(symbolsObj, sym) === true) {
          if (this.addSymbol(sym, symbolsObj[sym]) !== null) {
            addedSyms.push(sym);
          }
        }
      }

      return addedSyms;
    }
  };


  // Start the clock

  // Make sure scheduleUpdates always has the right receiver.
  CurrentTime.scheduleUpdates = _bind(
    CurrentTime.scheduleUpdates, CurrentTime
  );

  for (var sym in CurrentTime.timeSymbolFns) {
    if (_hasProp.call(CurrentTime.timeSymbolFns, sym) === true) {
      CurrentTime.timeSymbolFns[sym] = _bind(
        CurrentTime.timeSymbolFns[sym], CurrentTime
      );
    }
  }

  // It's export tiem, kids
  if (typeof window === "object") {
    window.CurrentTime = window.CurrentTime || CurrentTime;
  }

  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = CurrentTime;
  }

  // TODO: Add some nice jQuery plugin functionality.

  // Check for AMD
  if (typeof define === "function" && typeof require === "function") {
    define("CurrentTime", [], function() { return CurrentTime; });
  }

})();
