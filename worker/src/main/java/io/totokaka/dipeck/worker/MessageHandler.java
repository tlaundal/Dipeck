package io.totokaka.dipeck.worker;

import java.util.logging.Level;
import java.util.logging.Logger;

public class MessageHandler {

    private final Logger logger;
    private final Cache cache;
    private final Publisher publisher;

    public MessageHandler(Logger logger, Cache cache, Publisher publisher) {
        this.logger = logger;
        this.cache = cache;
        this.publisher = publisher;
    }

    public void handle(String numberText) throws NumberFormatException {
        long number = Long.parseLong(numberText);

        boolean isPrime = PrimeChecker.isPrime(number);

        this.logger.log(Level.INFO, "Got result for {0}: {1}", new String[]{numberText, String.valueOf(isPrime)});

        cache.cache(number, isPrime);
        publisher.publish(number, isPrime);
    }

}
