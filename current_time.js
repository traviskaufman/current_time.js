/**
 * CurrentTime.js - A javascript module that will take care of all of your
 * current time needs.
 *
 * @todo Finish Writing Tests.
 * @todo DOCUMENT!!
 */

 /*jshint browser:true, node:true */
 /*global define:true */
(function() {
  'use strict';
  var _global = this || {};

  var _hasProp = Object.prototype.hasOwnProperty;

  var _bind = function(fn, ctx) {
    return function() {
      return fn.apply(ctx, Array.prototype.slice.call(arguments));
    };
  };

  var _noop = function() {};

  var _onUpdate = _noop;

  var _getMeridian = function(rawHours) {
    return (rawHours < 12) ? 'am' : 'pm';
  };

  var _oldCurrentTime = _global.CurrentTime;

  var _parseDate = function(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    return {
      hours: _splitTime(hours),
      minutes: _splitTime(minutes),
      seconds: _splitTime(seconds),
      meridian: _getMeridian(hours),
      toTwelveHrFormat: function() {
        return {
          hours: _splitTime(_toTwelveHrFormat(this.hours.raw)),
          minutes: this.minutes,
          seconds: this.seconds,
          meridian: this.meridian
        };
      }
    };
  };

  var _splitTime = function(time) {
    return {
      tens: _tens(time),
      ones: _ones(time),
      raw: time
    };
  };


  // The following 3 methods assume that 0 ≤ <code>num</code> ≤ 99.
  // They could be scaled with modulo but since this is a clock, where
  // we never have more than double-digits, it's a meaningless sacrifice
  // of efficiency.

  var _tens = function(num) {
    return parseInt(num * 0.1, 10);
  };

  var _ones = function(num) {
    return num % 10;
  };

  var _toZeroPaddedString = function(num) {
    return (num < 10) ? '0' + num : num.toString();
  };

  var _toTwelveHrFormat = function(hrs) {
    return ((hrs % 12) === 0) ? 12 : (hrs % 12);
  };

  var _currentTime = {}; // Filled on init().

  var _timeStringSymbols = [];

  var _buildTimeRegex = function() {
    return new RegExp(
      '%(' + _timeStringSymbols.join('|') + '){1}', 'g'
    );
  };

  var _scheduleUpdates = function(__ct) {
    var date = new Date();
    __ct.update(date);
    // Dat accuracy
    setTimeout(function() {
      _scheduleUpdates(__ct);
    }, 1000 - date.getMilliseconds());
  };

  var _timeStringRegex = null;

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

        opts = (typeof opts === 'object') ? opts : {};
        if (typeof opts.onUpdate === 'function') {
          this.onUpdate(opts.onUpdate);
        }

        _scheduleUpdates(this);
      };
    })(),

    /**
     * Callback to be invoked whenever the current time is updated.
     *
     * You can set this before calling init if you'd like, or just pass it in
     * as an option to init, or set it after calling init. It's flexible :)
     */
    onUpdate: function(updateFn) {
      if (typeof updateFn !== 'function') {
        return;
      }

      _onUpdate = _bind(updateFn, this);
    },

    update: function(date) {
      _currentTime = _parseDate(date);
      _onUpdate(this.get(), date);
    },

    get: function() {
      return _currentTime;
    },

    mkString: function(str) {
      var _this = this;

      if (typeof str !== 'string') {
        str = '%h:%m:%s %a';
      }

      return str.replace(_timeStringRegex, function(match, sym) {
        if (_hasProp.call(_this.timeSymbolFns, sym) === true) {
          return _this.timeSymbolFns[sym].call(_this, _this.get());
        } else {
          return match;
        }
      });
    },

    hours: function() {
      return this.get().hours;
    },

    minutes: function() {
      return this.get().minutes;
    },

    seconds: function() {
      return this.get().seconds;
    },

    meridian: function() {
      return _getMeridian(_currentTime.hours.raw);
    },

    toString: function() {
      return this.mkString();
    },

    timeSymbolFns: {},

    addSymbol: function(sym, symFn, rebuild) {
      var addedSym = null;
      rebuild = (typeof rebuild === 'boolean') ? rebuild : true;

      if (typeof sym === 'string' &&
          sym.length === 1 &&
          typeof symFn === 'function') {

        this.timeSymbolFns[sym] = _bind(symFn, CurrentTime);

        // Don't add a symbol if we're simply changing an already-defined
        // symbol.
        if (_timeStringSymbols.indexOf(sym) === -1) {
          _timeStringSymbols.push(sym);

          if (rebuild === true) {
            _timeStringRegex = _buildTimeRegex();
          }
        }
        addedSym = sym;
      }

      return addedSym;
    },

    addSymbols: function(symbolsObj) {
      var addedSyms = [];

      for (var sym in symbolsObj) {
        if (_hasProp.call(symbolsObj, sym) === true) {
          if (this.addSymbol(sym, symbolsObj[sym], false) !== null) {
            addedSyms.push(sym);
          }
        }
      }

      _timeStringRegex = _buildTimeRegex();

      return addedSyms;
    },

    noConflict: function() {
      _global.CurrentTime = _oldCurrentTime;
      return CurrentTime;
    }
  };

  // Make sure scheduleUpdates always has the right receiver.
  CurrentTime.scheduleUpdates = _bind(
    CurrentTime.scheduleUpdates, CurrentTime
  );

  // Register all of the default time symbols.
  CurrentTime.addSymbols({
    // Adapted from PHP's date formatting symbols. Yes, PHP, I know, you hate
    // me, I hate me, etc.
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

    a: function() {
      return this.meridian();
    },

    A: function() {
      return this.meridian().toUpperCase();
    }
  });

  // Browser
  if (typeof window === 'object') {
    window.CurrentTime = CurrentTime;
  }

  // NodeJS
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = CurrentTime;
  }

  // AMD/RequireJS
  if (typeof define === 'function' && typeof require === 'function') {
    define('CurrentTime', [], function() { return CurrentTime; });
  }

})();
