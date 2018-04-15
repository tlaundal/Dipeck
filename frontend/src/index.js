class PrimeChecker {
  constructor(form, result) {
    this.form = form;
    this.result = result;

    this.form.addEventListener('submit', this.submit.bind(this));
  }

  async submit(event) {
    event.preventDefault();

    this.result.innerHTML = 'Calculating...';

    const number = this.form[0].value;
    const res = await fetch(`/request/is-prime?num=${number}`);
    if (!res.ok) {
      this.result.innerHTML = 'Error while checking primality...';
      return;
    }

    const body = await res.json();

    if (body.type === 'result') {
      this.setResult(number, body.result);
    } else if (body.type === 'enqueued'){
      this.result.innerHTML = 'Still calculating...';
      this.lookingFor = parseInt(number);
      this.ensureListening();
    } else {
      this.result.innerHTML = 'The servers is behaving badly...';
    }
  }

  setResult(number, result) {
    this.result.innerHTML =
      result ? `${number} is prime!` : `${number} is not prime.`;
  }

  ensureListening() {
    if (!this.socket || this.socket.readyState > 1) {
      this.socket = new WebSocket(`ws://${window.location.hostname}/notification`);
      this.socket.addEventListener('message', this.onMessage.bind(this));
      this.socket.addEventListener('open', this.onOpen.bind(this));
    } else {
      this.onOpen();
    }
  }

  onOpen() {
    this.socket.send(this.lookingFor.toString());
  }

  onMessage(message) {
    const parts = message.data.split(':');
    if (parts.length !== 2 || parseInt(parts[0]) !== this.lookingFor) {
      return;
    }

    this.socket.close();
    this.setResult(this.lookingFor, !!parseInt(parts[1]));
  }
}

document.addEventListener('DOMContentLoaded', function init() {
  const form = document.getElementById('is_prime_form');
  const result = document.getElementById('is_prime_result');

  new PrimeChecker(form, result);
});
