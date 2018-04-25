/* eslint-env mocha, node */
const { JSDOM } = require('jsdom');
const sinon = require('sinon');
const assert = require('assert');
const unroll = require('unroll');
unroll.use(it);

describe('frontend', function() {
  let window;

  before(async function() {
    const dom = await JSDOM.fromFile(`${__dirname}/../src/index.html`, {
      runScripts: 'dangerously',
      resources: 'usable'
    });
    window = dom.window;

    return new Promise(resolve => {
      window.document.addEventListener('dipeck-loaded', resolve);
    });
  });

  describe('#queryIsPrime()', function() {
    before(function() {
      window.fetch_original = window.fetch;
    });
    after(function() {
      window.fetch = window.fetch_original;
      delete window.fetch_original;
    });
    function fakeResponse(result, ok=true) {
      return {
        ok,
        json: sinon.stub().resolves(result)
      };
    }

    it('should fetch from server', async function() {
      window.fetch = sinon.stub().resolves(fakeResponse({type:'enqueued'}));

      await window.document.dipeck.queryIsPrime(13);

      assert.ok(window.fetch.withArgs('/request/is-prime?num=13'));
    });

    unroll('should parse #type results', async function(data) {
      window.fetch = sinon.stub().resolves(data.response);

      const actual = await window.document.dipeck.queryIsPrime(134);

      assert.deepEqual(actual, data.expected);
    }, [
      ['type', 'response', 'expected'],
      ['result', fakeResponse({type:'result',number:134,isPrime:false}), {type:'result',number:134,isPrime:false}],
      ['enqueued', fakeResponse({type:'enqueued'}), {type:'enqueued'}]
    ]);

    unroll('should error on #type responses', async function(data) {
      window.fetch = sinon.stub().resolves(data.response);

      try {
        await window.document.dipeck.queryIsPrime(134);
        assert.fail();
      } catch (e) {
        // Success!
      }
    }, [
      ['type', 'response'],
      ['uknown', fakeResponse({type:'uknown'})],
      ['not-ok', fakeResponse({type:'enqueued'},false)]
    ]);
  });

  describe('PrimeResultListener', function() {
    let primeResultListener;
    beforeEach(function() {
      primeResultListener = new window.document.dipeck.PrimeResultListener();
      primeResultListener._document = window.document;
      primeResultListener.socket = sinon.createStubInstance(window.WebSocket);
    });

    describe('#listen()', function() {
      it('should attach open listener');
      it('should attach message listener');
      it('should reuse old connection if open');
      it('should use correct path');
    });

    describe('#doHandshake()', function() {
      it('should not send target when no target exists', function() {
        primeResultListener.doHandshake();

        assert.ok(primeResultListener.socket.send.notCalled);
      });

      unroll('should send target when target is #target', function(data) {
        primeResultListener.target = data.target;
        primeResultListener.doHandshake();

        assert.ok(
          primeResultListener.socket.send.withArgs(data.target.toString()).calledOnce);
      }, [
        ['target'],
        [123],
        [0]
      ]);
    });

    describe('#onMessage()', function() {
      it('should close the websocket on relevant message', function() {
        primeResultListener.target = 123;
        primeResultListener.onMessage({data:'123:0'});

        assert.ok(primeResultListener.socket.close.calledOnce);
      });
      it('should not close the websocket on non-relevant message', function () {
        primeResultListener.target = 123;
        primeResultListener.onMessage({data:'113:1'});

        assert.ok(primeResultListener.socket.close.notCalled);
      });
      it('should dispatch event for relevant message', async function() {
        const eventPromise = new Promise(resolve => {
          primeResultListener.addEventListener('result', resolve);
        });

        primeResultListener.target = 113;
        primeResultListener.onMessage({data:'113:1'});

        const {detail} = await eventPromise;

        assert.deepEqual({type: 'result', number: 113, isPrime: true}, detail);
      });
    });
  });
});
