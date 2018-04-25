package io.totokaka.dipeck.worker.handling;

import io.totokaka.dipeck.worker.service.Cache;
import io.totokaka.dipeck.worker.service.Publisher;

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

    public void handle(long number) {
        this.logger.info("Starting work on " + number);

        boolean isPrime = PrimeChecker.isPrime(number);

        cache.cache(number, isPrime);
        publisher.publish(number, isPrime);
    }

}
