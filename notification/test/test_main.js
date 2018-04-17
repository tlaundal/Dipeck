/* eslint-env mocha */
const assert = require('assert');
const sinon = require('sinon');
const WebSocket = require('ws');
const winston = require('winston');
const DipeckNotification = require('../src/main.js');
const Redis = require('../src/redis.js');

describe('main', function() {
  let cache;
  let logger;
  let ws$;
  let ws;

  function useMock() {
    ws = Object.create(WebSocket.prototype);
    ws$ = sinon.mock(ws);
  }

  beforeEach(function() {
    cache = sinon.createStubInstance(Redis);
    logger = sinon.stub(winston.createLogger());
    ws = sinon.createStubInstance(WebSocket);
  });

  describe('DipeckNotification', function() {
    let notification;

    beforeEach(function() {
      notification = new DipeckNotification(logger, cache);
    });

    describe('#onConnection()', function() {
      it('should register a close handler', function() {
        notification.onConnection(ws);
        assert.ok(ws.on.withArgs('close').calledOnce);
      });
    });
    describe('#onMessage()', function() {
      it('should broadcast to multiple clients', function() {
        const ws2 = sinon.createStubInstance(WebSocket);
        notification.onConnection(ws);
        notification.onConnection(ws2);

        notification.onMessage('calculation-results', '100:0');

        assert.ok(ws.send.called);
        assert.ok(ws2.send.called);
      });
      it('should not broadcast when recieving other channel', function () {
        notification.onConnection(ws);
        notification.onMessage('asdf');

        assert.ok(ws.send.notCalled);
      });
      it('should not broadcast when wrong format', function () {
        notification.onConnection(ws);
        notification.onMessage('calculation-results', '100');

        assert.ok(ws.send.notCalled);
      });
      it('should pass on correctly for prime result', function() {
        notification.onConnection(ws);
        notification.onMessage('calculation-results', '149:1');

        assert.ok(ws.send.withArgs('149:1').calledOnce);
      });
      it('should pass on correctly for non prime result', function() {
        notification.onConnection(ws);
        notification.onMessage('calculation-results', '100:0');

        assert.ok(ws.send.withArgs('100:0').calledOnce);
      });
    });
  });

  describe('Client', function() {
    let client;

    function constructClient() {
      client = new DipeckNotification.Client(logger, cache, ws);
    }

    describe('#constructor()', function() {
      it('should register handler for messages', function() {
        constructClient();

        assert.ok(ws.on.withArgs('message').calledOnce);
      });
    });

    describe('#broadcast()', function () {
      it('should format nonPrime messages correctly', function() {
        useMock();
        ws$.expects('send').withArgs('100:0').once();

        constructClient();
        client.broadcast(100, false);

        ws$.verify();
      });
      it('should format prime messages correctly', function() {
        useMock();
        ws$.expects('send').withArgs('113:1').once();

        constructClient();
        client.broadcast(113, true);

        ws$.verify();
      });
      it('should allways broadcast when there is no target', function() {
        constructClient();
        client.broadcast();

        assert.ok(ws.send.called);
      });
      it('should broadcast when the target is correct', function() {
        constructClient();
        client.onMessage('100');
        client.broadcast(100);

        assert.ok(ws.send.called);
      });
      it('should not broadcast when the target is incorrect', function() {
        constructClient();
        client.onMessage('113');
        client.broadcast(100);

        assert.ok(ws.send.notCalled);
      });
    });

    describe('#onMessage()', function () {
      it('should not broadcast if not in cache', async function() {
        constructClient();
        await client.onMessage('111');

        assert.ok(ws.send.notCalled);
      });
      it('should broadcast correct value from cache for primes', async function() {
        cache.exists.withArgs('113').returns(Promise.resolve(true));
        cache.get.withArgs('113').returns(Promise.resolve('1'));
        constructClient();
        await client.onMessage('113');

        assert.ok(ws.send.withArgs('113:1').called);
      });
      it('should broadcast correct value from cache for non-primes', async function() {
        cache.exists.withArgs('112').returns(Promise.resolve(true));
        cache.get.withArgs('112').returns(Promise.resolve('0'));
        constructClient();
        await client.onMessage('112');

        assert.ok(ws.send.withArgs('112:0').called);
      });
    });
  });
});
