package io.totokaka.dipeck.worker.handling;

public class PrimeChecker {

    public static boolean isPrime(long number) {
        for (long i = 2; i <= number/2; i++) {
            if (number % i == 0) {
                return false;
            }
        }
        return true;
    }

}
