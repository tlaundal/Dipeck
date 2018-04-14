function isPrime(number) {
  number == 1;
}

class PrimeChecker {
  constructor(form, result) {
    this.form = form;
    this.result = result;

    this.form.addEventListener('submit', this.submit.bind(this));
  }

  submit(event) {
    event.preventDefault();

    isPrime(this.form[0].value);

    this.result.innerHTML = 'Submitted';
  }
}

document.addEventListener('DOMContentLoaded', function init() {
  const form = document.getElementById('is-prime-form');
  const result = document.getElementById('is-prime-result');

  PrimeChecker(form, result);
});
