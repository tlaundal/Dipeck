package io.totokaka.dipeck.worker;

import java.util.logging.Level;
import java.util.logging.Logger;

public class MessageHandler {

    private final Logger logger;

    public MessageHandler(Logger logger) {
        this.logger = logger;
    }

    public void handle(String numberText) throws NumberFormatException {
        long number = Long.parseLong(numberText);

        boolean isPrime = PrimeChecker.isPrime(number);
        this.logger.log(Level.INFO, "Got result for {0}: {1}", new String[]{numberText, String.valueOf(isPrime)});

        // TODO save in redis and publish
    }

}
