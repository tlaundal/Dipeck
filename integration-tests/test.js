const assert = require('assert');
const request = require('request-promise-native');
const compose = require('docker-composer-manager');
const { JSDOM } = require('jsdom');

const composeFile = __dirname + '/../docker-compose.yml';
let address;

function delay(t) {
  return new Promise(function(resolve) {
    setTimeout(resolve, t);
  });
}

function log(msg) {
  console.log(msg); // eslint-disable-line no-console
}

function getComposeArgs() {
  if (process.env['CI']) {
    log('Running as CI (without --renew-anon-volumes)');
    return [];
  } else {
    return ['--renew-anon-volumes'];
  }
}

before(async function startDocker() {
  this.timeout(5 * 60 * 1000);
  log('Starting docker.. May take a while');
  await compose.dockerComposeUp(composeFile, getComposeArgs());

  const port = await compose.dockerInspectPortOfContainer('dipeck_frontend_1');
  const host = (process.env.DOCKER_HOST || 'localhost').split(':')[0];
  address = `${host}:${port}`;

  log('Docker is up, waiting 10 extra seconds for services to settle');
  await delay(12000);
  log();
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


  });
});

after(async function stopDocker() {
  this.timeout(60000);
  log('Stopping docker...');
  await compose.dockerComposeStop(composeFile);
  log('Stopped');
});
