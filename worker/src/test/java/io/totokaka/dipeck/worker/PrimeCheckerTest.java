package io.totokaka.dipeck.worker;

import org.junit.Ignore;
import org.junit.Test;

import static org.junit.Assert.*;

public class PrimeCheckerTest {

    @Test
    public void isPrime() {
        assertTrue("1 should be prime", PrimeChecker.isPrime(1));
        assertTrue("2 should be prime", PrimeChecker.isPrime(2));
        assertTrue("3 should be prime", PrimeChecker.isPrime(3));
        assertFalse("4 should not be prime", PrimeChecker.isPrime(4));
        assertFalse("124 should not be prime", PrimeChecker.isPrime(124));
        assertTrue("113 should be prime", PrimeChecker.isPrime(113));
    }

    @Test
    @Ignore
    public void testLong() {
        // Takes about 2 minutes to compute
        assertTrue("Long number", PrimeChecker.isPrime(22801763489L));
    }

}