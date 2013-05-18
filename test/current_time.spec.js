/**
 * Unit tests for CurrentTime module.
 */

describe('CurrentTime.js', function() {
  describe('Core Funtionality', function() {
    var CurrentTime = require('../current_time');
    var dateObj = new Date("Mon, 1 Apr 2013 13:21:46");

    before(function() {
      CurrentTime.update(dateObj);
    });

    describe('Date parsing', function() {
      var curTime;
      before(function() {
        curTime = CurrentTime.get();
      });

      var assertValidTimeComponent = function(timeComponent, expected) {
        timeComponent.raw.should.equal(expected);

        ((timeComponent.tens * 10) + timeComponent.ones)
          .should.equal(expected);
      };

      it('parses hours', function() {
        assertValidTimeComponent(curTime.hours, 13);
      });

      it('parses minutes', function() {
        assertValidTimeComponent(curTime.minutes, 21);
      });

      it('parses seconds', function() {
        assertValidTimeComponent(curTime.seconds, 46);
      });
    });

    describe('Printing/Output Formatting', function() {

      it('determines the proper meridian', function() {
        CurrentTime.getMeridian().should.equal("pm");
      });

      it('pretty-prints when toString() is called on it', function() {
        CurrentTime.toString().should.equal("1:21:46 pm");
      });

      it('allows clients to create time strings of their own', function() {
        var str = CurrentTime.mkString("hi %G %g %H %h %m %s %a %A");
        var expected = "hi 13 01 13 1 21 46 pm PM";
        str.should.equal(expected);
      });

      it("won't bail if clients pass in an invalid time string", function() {
        var str = CurrentTime.mkString("%G %y");
        str.should.equal("13 %y");
      });

    });

  });
});
