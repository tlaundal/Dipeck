/* eslint-env mocha */
const assert = require('assert');
const sinon = require('sinon');
const Redis = require('../src/redis.js');
const { RedisClient } = require('redis');

describe('Redis', function() {
  let redis;
  let factory;
  let client;

  beforeEach(function() {
    client = sinon.createStubInstance(RedisClient);
    factory = sinon.stub().returns(client);
  });

  function createRedis(host='localhost', port=6379) {
    redis = new Redis(host, port);
    redis.connect(factory);
  }

  describe('#connect()', function() {
    it('should pass the correct host and port', function() {
      createRedis('something', 4132);

      assert.ok(factory.withArgs(4132, 'something').calledOnce);
    });
  });
  describe('#subscribe()', function() {
    it('should pass the correct host and port to the factory', function() {
      createRedis('something', 4132);
      redis.subscribe('channel', () => {}, factory);

      assert.equal(factory.withArgs(4132, 'something').callCount, 2);
    });
    it('should attach listener and subscribe', function() {
      createRedis();
      const listener = () => {};
      redis.subscribe('channel', listener, factory);

      assert.ok(client.on.withArgs('message').called);
      assert.ok(client.subscribe.withArgs('channel').called);
    });
  });
  describe('#exists()', function() {
    it('should work for existing keys', async function() {
      client.exists.callsFake((key, cb) => {
        assert.equal(key, 'somekey');
        cb(null, true);
      });
      createRedis();
      const actual = await redis.exists('somekey');

      assert.equal(actual, true);
    });
    it('should work for non-existing keys', async function() {
      client.exists.callsFake((key, cb) => {
        assert.equal(key, 'somekey');
        cb(null, false);
      });
      createRedis();
      const actual = await redis.exists('somekey');

      assert.equal(actual, false);
    });
  });
  describe('#get()', function() {
    it('should work for true values', async function() {
      client.get.callsFake((key, cb) => {
        assert.equal(key, 'somekey');
        cb(null, '1');
      });
      createRedis();
      const actual = await redis.get('somekey');

      assert.equal(actual, '1');
    });
    it('should work for false values', async function() {
      client.get.callsFake((key, cb) => {
        assert.equal(key, 'somekey');
        cb(null, '0');
      });
      createRedis();
      const actual = await redis.get('somekey');

      assert.equal(actual, '0');
    });
  });
  describe('#ping()', function() {
    it('should call through', async function () {
      createRedis();
      await redis.ping();

      assert.ok(client.ping.called);
    });
  });
});
