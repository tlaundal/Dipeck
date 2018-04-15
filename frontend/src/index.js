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
      this.result.innerHTML =
        body.result ? `${number} is prime!` : `${number} is not prime.`;
    } else if (body.type === 'enqueued'){
      this.result.innerHTML = 'Still calculating...';
      // TODO listen for result
    } else {
      this.result.innerHTML = 'The servers is behaving badly...';
    }
  }
}

document.addEventListener('DOMContentLoaded', function init() {
  const form = document.getElementById('is_prime_form');
  const result = document.getElementById('is_prime_result');

  new PrimeChecker(form, result);
});
