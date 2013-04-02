/**
 * CurrentTime.js - A javascript module that will take care of all of your
 * current time needs.
 * @todo onUpdate() method
 * @todo convert hours/minutes/seconds to 12 hour format
 */
(function() {
  'use strict';

  var _bind = function(fn, ctx) {
    return function() {
      return fn.apply(ctx, Array.prototype.slice.call(arguments));
    };
  };

  var CurrentTime = {

    // We only want this to be called once.
    init: (function() {
      var called = false;
      return function() {
        if (called) {
          return;
        }

        called = true;
        this.scheduleUpdates();
      };
    })(),

    update: function(date) {
      this._currentTime = this._parseDate(date);
    },

    scheduleUpdates: function() {
      var date = new Date();
      this.update(date);
      // Dat accuracy
      setTimeout(this.scheduleUpdates, 1000 - date.getMilliseconds());
    },

    get: function() {
      return this._currentTime;
    },

    mkString: function(str) {
      var _this = this;

      if (typeof str !== "string") {
        str = "%h:%m:%s %a";
      }

      return str.replace(_this._timeStringRegex, function(_, sym) {
        return _this.timeSymbolFns[sym]();
      });
    },

    getMeridian: function() {
      return (this._currentTime.hours.raw < 12) ? "am" : "pm";
    },

    toString: function() {
      return this.mkString();
    },

    // Filled on init.
    _currentTime: {},

    _parseDate: function(date) {
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();

      return {
        hours: this._splitTime(hours),
        minutes: this._splitTime(minutes),
        seconds: this._splitTime(seconds)
      };
    },

    // The following 3 methods assume that 0 ≤ <code>num</code> ≤ 99.
    // They could be scaled with modulo but since this is a clock, where
    // we never have more than double-digits, it's a meaningless sacrifice
    // of efficiency.

    _splitTime: function(time) {
      return {
        tens: this._tens(time),
        ones: this._ones(time),
        raw: time
      };
    },

    _tens: function(num) {
      return parseInt(num * 0.1, 10);
    },

    _ones: function(num) {
      return num % 10;
    },

    _timeStringRegex: /%(h|H|g|G|m|s|a|A){1}/g,

    // Adapted from PHP's date formatting.
    timeSymbolFns: {
      h: function () {
        return this._toTwelveHrFormat(this._currentTime.hours.raw).toString();
      },

      H: function() {
        return this._currentTime.hours.raw.toString();
      },

      g: function() {
        return this._toZeroPaddedString(
          this._toTwelveHrFormat(this._currentTime.hours.raw)
        );
      },

      G: function() {
        return this._toZeroPaddedString(this._currentTime.hours.raw);
      },

      m: function() {
        return this._toZeroPaddedString(this._currentTime.minutes.raw);
      },

      s: function() {
        return this._toZeroPaddedString(this._currentTime.seconds.raw);
      },

      a: function() {
        return this.getMeridian();
      },

      A: function() {
        return this.getMeridian().toUpperCase();
      }
    },

    _toZeroPaddedString: function(num) {
      return (num < 10) ? "0" + num : num.toString();
    },

    _toTwelveHrFormat: function(time) {
      return ((time % 12) === 0) ? 12 : (time % 12);
    }
  };


  // Start the clock
  CurrentTime.scheduleUpdates = _bind(
    CurrentTime.scheduleUpdates, CurrentTime
  );

  for (var sym in CurrentTime.timeSymbolFns) {
    var bound = _bind(CurrentTime.timeSymbolFns[sym], CurrentTime);
    CurrentTime.timeSymbolFns[sym] = bound;
  }

  CurrentTime.init();

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
