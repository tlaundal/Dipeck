const assert = require('assert');
const request = require('request-promise-native');
const compose = require('docker-composer-manager');

const composeFile = __dirname + '/../docker-compose.yml';
let address;

before(async function() {
  this.timeout(0);
  console.log('Starting docker.. May take a while');
  await compose.dockerComposeUp(composeFile);
  const port = await compose.dockerInspectPortOfContainer('dipeck_frontend_1');
  const host = (process.env.DOCKER_HOST || 'localhost').split(':')[0];
  address = `${host}:${port}`
  console.log('Docker is up');
  console.log();
});

describe('frontend', function() {
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
});

after(async function() {
  this.timeout(0);
  console.log('Stopping docker...');
  await compose.dockerComposeStop(composeFile);
  console.log('Stopped');
});
