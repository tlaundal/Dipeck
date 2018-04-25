/* eslint-env mocha */
const assert = require('assert');
const sinon = require('sinon');
const WebSocket = require('ws');
const winston = require('winston');
const DipeckNotification = require('../src/main.js');
const Redis = require('../src/redis.js');

const CHANNEL_NAME = 'calculation-results';

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

    describe('#constructor()', function() {
      it('should subscribe to redis channel', function() {
        assert.ok(cache.subscribe.withArgs(CHANNEL_NAME).calledOnce);
      });
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

        notification.onMessage(CHANNEL_NAME,
          '{"type": "result","number":100,"isPrime":false}');

        assert.ok(ws.send.called);
        assert.ok(ws2.send.called);
      });
      it('should not broadcast when recieving other channel', function () {
        notification.onConnection(ws);
        notification.onMessage('asdf',
          '{"type": "result","number":100,"isPrime":false}');

        assert.ok(ws.send.notCalled);
      });
      it('should not broadcast when wrong format', function () {
        notification.onConnection(ws);
        notification.onMessage(CHANNEL_NAME, '100');

        assert.ok(ws.send.notCalled);
      });
      it('should pass on correctly for prime result', function() {
        const packet = {type: 'result', number: 149, isPrime: true};
        notification.onConnection(ws);
        notification.onMessage(CHANNEL_NAME, JSON.stringify(packet));

        const out = ws.send.firstCall.args[0];
        assert.deepEqual(JSON.parse(out), packet);
      });
      it('should pass on correctly for non prime result', function() {
        const packet = {type: 'result', number: 100, isPrime: false};
        notification.onConnection(ws);
        notification.onMessage(CHANNEL_NAME, JSON.stringify(packet));

        const out = ws.send.firstCall.args[0];
        assert.deepEqual(JSON.parse(out), packet);
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
      it('should allways broadcast when there is no target', function() {
        constructClient();
        client.broadcast({type: 'result', number: 1, isPrime: true});

        assert.ok(ws.send.called);
      });
      it('should broadcast when the target is correct', function() {
        constructClient();
        client.onMessage('100');
        client.broadcast({type: 'result', number: 100, isPrime: false});

        assert.ok(ws.send.called);
      });
      it('should not broadcast when the target is incorrect', function() {
        constructClient();
        client.onMessage('113');
        client.broadcast({type: 'result', number: 100, isPrime: false});

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

        assert.ok(ws.send.calledOnce);
        const out = ws.send.firstCall.args[0];
        assert.deepEqual(JSON.parse(out), {type: 'result', number: 113, isPrime: true});
      });
      it('should broadcast correct value from cache for non-primes', async function() {
        cache.exists.withArgs('112').returns(Promise.resolve(true));
        cache.get.withArgs('112').returns(Promise.resolve('0'));
        constructClient();
        await client.onMessage('112');

        assert.ok(ws.send.calledOnce);
        const out = ws.send.firstCall.args[0];
        assert.deepEqual(JSON.parse(out), {type: 'result', number: 112, isPrime: false});
      });
    });
  });
});
