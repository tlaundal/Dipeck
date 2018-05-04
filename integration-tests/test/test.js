const assert = require('assert');
const request = require('request-promise-native');
const { JSDOM } = require('jsdom');

let address;

before(async function startDocker() {
  const port = 80;
  const host = (process.env.DOCKER_HOST || 'localhost').split(':')[0];
  address = `${host}:${port}`;
});

describe('dipeck', function() {
  it('should serve a webpage', async function() {
    const res = await request({
      uri: `http://${address}/`,
      resolveWithFullResponse: true
    });

    assert.equal(res.statusCode, 200);
  });
  it('should have request up', async function() {
    const res = await request({
      uri: `http://${address}/request`,
      json: true
    });

    assert.equal(res.status, 'ok');
  });

  describe('frontend', function() {
    let window;
    before(async function loadInJSDOM() {
      // this.timeout(10);
      const dom = await JSDOM.fromURL(`http://${address}/`, {
        runScripts: 'dangerously',
        resources: 'usable'
      });
      window = dom.window;

      await new Promise(resolve => {
        window.document.addEventListener('dipeck-loaded', resolve);
      });
    });

    async function submit(number) {
      const form = window.document.forms['is_prime_form'];
      form.elements[0].value = number;
      form.elements[1].click();

      await new Promise(resolve => {
        window.document.addEventListener('dipeck-result', resolve);
      });
    }

    it('should find uncached non-primes', async function() {
      this.timeout(5000);
      await submit(8);
      assert.equal('8 is not prime', window.document.querySelector('#is_prime_result').innerHTML);
    });

    it('should find cached non-primes', async function() {
      this.timeout(5000);
      await submit(8);
      assert.equal('8 is not prime', window.document.querySelector('#is_prime_result').innerHTML);
    });

    it('should find uncached primes', async function() {
      this.timeout(5000);
      await submit(13);
      assert.equal('13 is prime', window.document.querySelector('#is_prime_result').innerHTML);
    });

    it('should find cached primes', async function() {
      this.timeout(5000);
      await submit(13);
      assert.equal('13 is prime', window.document.querySelector('#is_prime_result').innerHTML);
    });

    it.skip('should work with big numbers', async function() {
      this.timeout(15000);
      await submit(2305843009213693951);
      assert.equal('2305843009213693951 is prime', window.document.querySelector('#is_prime_result').innerHTML);
    });
  });
});
