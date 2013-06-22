/**
 * Unit tests for CurrentTime module.
 */

/*jshint node:true */
var sinon = require('sinon');
var CurrentTime = require('../current_time');

/*global describe:true, beforeEach:true, it:true, before:true */
describe('CurrentTime.js', function() {
  'use strict';
  describe('Core Funtionality', function() {
    var dateObj = new Date('Mon, 1 Apr 2013 13:21:46');
    var _update = function() { CurrentTime.update(dateObj); };

    var assertValidTimeComponent = function(timeComponent, expected) {
      timeComponent.raw.should.equal(expected);

      ((timeComponent.tens * 10) + timeComponent.ones)
        .should.equal(expected);
    };

    before(_update);

    describe('Date parsing', function() {
      var curTime;
      before(function() {
        curTime = CurrentTime.get();
      });

      it('parses hours', function() {
        assertValidTimeComponent(curTime.hours, 13);
      });

      it('parses minutes', function() {
        assertValidTimeComponent(curTime.minutes, 21);
      });

      it('parses seconds', function() {
        assertValidTimeComponent(curTime.seconds, 46);
      });

      it('parses the meridian', function() {
        curTime.meridian.should.equal('pm');
      });

      it('provides a convenience method for getting hours', function() {
        assertValidTimeComponent(CurrentTime.hours(), 13);
      });

      it('provides a convenience method for getting minutes', function() {
        assertValidTimeComponent(CurrentTime.minutes(), 21);
      });

      it('provides a convenience method for getting seconds', function() {
        assertValidTimeComponent(CurrentTime.seconds(), 46);
      });

      it('provides a convenience method for getting the meridian', function() {
        CurrentTime.meridian().should.equal('pm');
      });

      it('can convert the time to a twelve hour format', function() {
        assertValidTimeComponent(curTime.toTwelveHrFormat().hours, 1);
      });
    });

    describe('Printing/Output Formatting', function() {
      it('pretty-prints when toString() is called on it', function() {
        CurrentTime.toString().should.equal('1:21:46 pm');
      });

      it('allows clients to create time strings of their own', function() {
        var str = CurrentTime.mkString('hi %G %g %H %h %m %s %a %A');
        var expected = 'hi 13 01 13 1 21 46 pm PM';
        str.should.equal(expected);
      });

      it("won't bail if clients pass in an invalid time string", function() {
        var str = CurrentTime.mkString('%G %y');
        str.should.equal('13 %y');
      });
    });

    describe('Extensibility', function() {
      describe('Custom Update Function', function() {
        var _updateFn;

        beforeEach(function() {
          _updateFn = sinon.spy();
          CurrentTime.onUpdate(_updateFn);
          _update();
        });

        it('allows for a callback to be invoked on updates', function() {
          _updateFn.called.should.equal(true);
        });

        it('passes a time object as the first callback arg', function() {
          var timeArg = _updateFn.getCall(0).args[0];

          assertValidTimeComponent(timeArg.hours, 13);
          assertValidTimeComponent(timeArg.minutes, 21);
          assertValidTimeComponent(timeArg.seconds, 46);
          timeArg.meridian.should.equal('pm');
        });

        it('passes the raw date object as the 2nd callback arg', function() {
          _updateFn.getCall(0).args[1].should.eql(dateObj);
        });

        it('ensures CurrentTime is always the receiver', function() {
          _updateFn.calledOn(CurrentTime).should.equal(true);
        });
      });

      describe('Client-defined time symbols', function() {
        it('allows clients to add their own interpolated time symbols',
           function() {

          CurrentTime.addSymbol('x', function(t) {
            return t.meridian + t.meridian;
          });

          CurrentTime.mkString('time %x').should.equal('time pmpm');
        });

        it('allows clients to batch add time symbols', function() {
          // TODO
        });
      });
    });

  });
});
