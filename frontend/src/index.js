async function queryIsPrime(number) {
  const res = await fetch(`/request/is-prime?num=${number}`);
  if (!res.ok) {
    throw Error('Response not OK');
  }

  const result = await res.json();
  if (result.type === 'result') {
    return {
      type: 'result',
      result: {
        number,
        isPrime: result.result
      }
    };
  } else if (result.type === 'enqueued') {
    return {
      type: 'enqueued'
    };
  } else {
    throw Error('Uknown response');
  }
}

class PrimeResultListener extends EventTarget {
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
      this.socket.send(this.target.toString());
    }
  }

  onMessage(message) {
    const parts = message.data.split(':');
    if (parts.length !== 2 || parseInt(parts[0]) !== this.target) {
      return;
    }
    const isPrime = !!parseInt(parts[1]);
    this.socket.close();
    this.dispatchEvent(new CustomEvent('result', {
      detail: {
        number: this.target,
        isPrime
      }
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
  }

  async onSubmit(event) {
    event.preventDefault();
    const number = parseInt(this.input.value);

    this.status('Calculating...');
    const response = await queryIsPrime(number);

    if (response.type === 'result') {
      this.done(response.result);
    } else if (response.type === 'enqueued') {
      this.status('Still calculating...');
      this.primeResultListener.listen(number);
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

  const dipeck = new Dipeck(form[0], result);
  form.addEventListener('submit', dipeck.onSubmit);
  document.dispatchEvent(new Event('dipeck-loaded'));
});
