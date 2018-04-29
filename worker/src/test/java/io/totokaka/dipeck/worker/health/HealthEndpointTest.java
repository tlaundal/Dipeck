package io.totokaka.dipeck.worker.health;

import fi.iki.elonen.NanoHTTPD;
import org.junit.Before;
import org.junit.Test;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.Assert.*;

public class HealthEndpointTest {

    private Set<HealthChecked> checks;
    private HealthEndpoint endpoint;

    @Before
    public void setUp() throws Exception {
        checks = new HashSet<>();
        endpoint = new HealthEndpoint(checks);
    }

    private String request() {
        NanoHTTPD.Response resp = endpoint.serve(null);
        return new BufferedReader(new InputStreamReader(resp.getData()))
                .lines().collect(Collectors.joining("\n"));
    }

    @Test
    public void serve() {
        checks.add(() -> true);
        String data = request();

        assertEquals("true", data);
    }

    @Test
    public void serveFail() {
        checks.add(() -> false);
        String data = request();

        assertEquals("false", data);
    }

    @Test
    public void testCheckHealth() {
        checks.add(() -> true);
        checks.add(() -> true);
        checks.add(() -> true);

        assertTrue(endpoint.checkHealth());
    }

    @Test
    public void testCheckHealthFail() {
        checks.add(() -> true);
        checks.add(() -> false);
        checks.add(() -> true);

        assertFalse(endpoint.checkHealth());
    }
}