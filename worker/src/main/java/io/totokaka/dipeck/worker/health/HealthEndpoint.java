package io.totokaka.dipeck.worker.health;

import fi.iki.elonen.NanoHTTPD;

import java.util.Set;
import java.util.logging.Logger;

public class HealthEndpoint extends NanoHTTPD implements HealthChecked {
    private final Set<HealthChecked> healthCheckers;

    public HealthEndpoint(Set<HealthChecked> healthCheckers) {
        super("127.0.0.1",1109);
        this.healthCheckers = healthCheckers;
    }

    @Override
    public Response serve(IHTTPSession session) {
        String status = String.valueOf(checkHealth());
        return newFixedLengthResponse(Response.Status.OK, MIME_PLAINTEXT, status);
    }

    @Override
    public boolean checkHealth() {
        return this.healthCheckers.stream().allMatch(HealthChecked::checkHealth);
    }
}
