/**
 * Unit tests for CurrentTime module.
 */

describe('CurrentTime.js', function() {
  describe('Basic Funtionality', function() {
    var CurrentTime = require('../current_time');
    var dateObj = new Date("Mon, 1 Apr 2013 13:21:46");

    describe('Date parsing', function() {
      var curTime = null;
      var assertValidTimeComponent = function(timeComponent, expected) {
        timeComponent.raw.should.equal(expected);

        ((timeComponent.tens * 10) + timeComponent.ones)
          .should.equal(expected);
      };

      before(function() {
        CurrentTime.update(dateObj);
      });

      beforeEach(function() {
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

      it('determines the proper meridian', function() {
        CurrentTime.getMeridian().should.equal("pm");
      });

    });

  });
});
