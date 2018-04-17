/* eslint-env mocha */
const assert = require('assert');
const index = require('../src/index.js');

describe('index', function() {
  describe('#findProperties()', function () {
    it('should find properties', function() {
      process.env.DIPECK_CACHE_HOST = 'localhost';
      process.env.DIPECK_CACHE_PORT = '1234';

      const expected = {
        port: 1234,
        host: 'localhost'
      };
      const actual = index.findProperties();

      assert.deepEqual(actual, expected);
    });
  });
});
