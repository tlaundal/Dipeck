package io.totokaka.dipeck.worker.service;

import java.util.Objects;

public class Packet {

    public String type;
    public long number;
    public Boolean isPrime;

    public Packet() {
        // Reserved for Gson
    }

    public Packet(String type, long number, Boolean isPrime) {
        this.type = type;
        this.number = number;
        this.isPrime = isPrime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Packet packet = (Packet) o;
        return number == packet.number &&
                isPrime == packet.isPrime &&
                Objects.equals(type, packet.type);
    }

    @Override
    public int hashCode() {
        return Objects.hash(type, number, isPrime);
    }
}
