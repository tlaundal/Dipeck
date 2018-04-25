/**
 * Sends a query to the backend to check whether the number is prime.
 *
 * @param  {number} number - The number to check
 * @returns {object} The resulting object from the backend
 * @throws {Error} If the fetch call doesn't resolve or the response isn't ok
 */
async function queryIsPrime(number) {
  const res = await fetch(`/request/is-prime?num=${number}`).catch(err => ({
    ok: false,
    error: err
  }));
  if (!res.ok) {
    throw Error('Response not OK');
  }

  return await res.json();
}

class PrimeResultListener extends EventTarget {

  constructor() {
    super();
    // Workaround for JSDOM
    this._document = window.document;
  }

  listen(number, path=`ws://${window.location.hostname}/notification`) {
    this.target = number;

    if (!this.socket || this.socket.readyState > 1) {
      this.socket = new WebSocket(path);
      this.socket.addEventListener('message', this.onMessage.bind(this));
      this.socket.addEventListener('open', this.doHandshake.bind(this));
    } else {
      this.doHandshake();
    }
  }

  doHandshake() {
    if (this.target || this.target === 0) {
      this.socket.send(JSON.stringify({
        type: 'target',
        number: this.target
      }));
    }
  }

  onMessage(message) {
    const packet = JSON.parse(message.data);
    if (packet.type !== 'result' || packet.number !== this.target) {
      return;
    }
    this.socket.close();
    this.dispatchEvent(new CustomEvent('result', {
      detail: packet
    }));
  }

}

class Dipeck {
  constructor(input, target) {
    this.input = input;
    this.target = target;

    this.primeResultListener = new PrimeResultListener();
    this.primeResultListener.addEventListener('result',
      e => this.done(e.detail));

    this.onSubmit = this.onSubmit.bind(this);
  }

  status(message) {
    this.target.innerHTML = message;
  }

  done(result) {
    this.status(`${result.number} is ${result.isPrime ? 'prime' : 'not prime'}`);
    document.dispatchEvent(new Event('dipeck-result'));
  }

  async onSubmit(event) {
    event.preventDefault();
    const number = parseInt(this.input.value);

    this.status('Calculating...');
    const response = await queryIsPrime(number).catch(err => ({
      type: 'error',
      error: err
    }));

    if (response.type === 'result') {
      this.done(response);
    } else if (response.type === 'enqueued') {
      this.status('Still calculating...');
      this.primeResultListener.listen(number);
    } else if (response.type === 'error') {
      this.status('An error occured');
    }
  }
}

document.dipeck = {
  Dipeck,
  PrimeResultListener,
  queryIsPrime
};
document.addEventListener('DOMContentLoaded', function init() {
  const form = document.getElementById('is_prime_form');
  const result = document.getElementById('is_prime_result');

  const dipeck = new Dipeck(form.elements[0], result);
  form.addEventListener('submit', dipeck.onSubmit);
  document.dispatchEvent(new Event('dipeck-loaded'));
});
