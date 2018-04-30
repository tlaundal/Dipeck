#!/usr/bin/env node
const WebSocket = require('ws');

async function checkHealth() {
  const sock = new WebSocket('ws://localhost:8080');

  await new Promise(resolve => sock.on('open', resolve));

  const promise = new Promise((resolve, reject) => {
    sock.on('message', msg => {
      const packet = JSON.parse(msg);
      if (packet.type == 'status' && packet.healthy) {
        resolve();
      } else {
        reject();
      }
    });
  });

  sock.send(JSON.stringify({type: 'status'}));
  return promise;
}

checkHealth().then(() => {
  process.exit(0);
}).catch(() => {
  process.exit(1);
});
