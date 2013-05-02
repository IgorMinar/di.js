'user strict';

beforeEach(function() {

  this.addMatchers({
    toBeInstanceOf: function(expected) {

      this.message = function() {
        var msg = "Expected " + this.actual;

        if (this.actual) {
          msg += "(" + this.actual.constructor.name + ")"
        }

        msg += " to be an instance of " + (expected ? expected.name : expected);

        return msg;
      };

      return this.actual instanceof expected
    },

    toHaveBeenCalledOnce: function() {
      if (arguments.length > 0) {
        throw new Error('toHaveBeenCalledOnce does not take arguments, use toHaveBeenCalledWith');
      }

      if (!jasmine.isSpy(this.actual)) {
        throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
      }

      this.message = function() {
        var msg = 'Expected spy ' + this.actual.identity + ' to have been called once, but was ',
            count = this.actual.callCount;
        return [
          count === 0 ? msg + 'never called.' :
              msg + 'called ' + count + ' times.',
          msg.replace('to have', 'not to have') + 'called once.'
        ];
      };

      return this.actual.callCount == 1;
    },

    toHaveBeenCalledOnceWith: function() {
      var expectedArgs = jasmine.util.argsToArray(arguments);

      if (!jasmine.isSpy(this.actual)) {
        throw new Error('Expected a spy, but got ' + jasmine.pp(this.actual) + '.');
      }

      this.message = function() {
        if (this.actual.callCount != 1) {
          if (this.actual.callCount == 0) {
            return [
              'Expected spy ' + this.actual.identity + ' to have been called once with ' +
                  jasmine.pp(expectedArgs) + ' but it was never called.',
              'Expected spy ' + this.actual.identity + ' not to have been called with ' +
                  jasmine.pp(expectedArgs) + ' but it was.'
            ];
          }

          return [
            'Expected spy ' + this.actual.identity + ' to have been called once with ' +
                jasmine.pp(expectedArgs) + ' but it was called ' + this.actual.callCount + ' times.',
            'Expected spy ' + this.actual.identity + ' not to have been called once with ' +
                jasmine.pp(expectedArgs) + ' but it was.'
          ];
        } else {
          return [
            'Expected spy ' + this.actual.identity + ' to have been called once with ' +
                jasmine.pp(expectedArgs) + ' but was called with ' + jasmine.pp(this.actual.argsForCall),
            'Expected spy ' + this.actual.identity + ' not to have been called once with ' +
                jasmine.pp(expectedArgs) + ' but was called with ' + jasmine.pp(this.actual.argsForCall)
          ];
        }
      };

      return this.actual.callCount === 1 && this.env.contains_(this.actual.argsForCall, expectedArgs);
    }
  });
});
