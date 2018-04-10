function isPrime(number) {
  console.log("Pretending to check prime for", number);
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

let instance;
document.addEventListener('DOMContentLoaded', function init() {
  const form = document.getElementById('is-prime-form');
  const result = document.getElementById('is-prime-result');

  instance = new PrimeChecker(form, result);
});
