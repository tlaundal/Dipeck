FROM gradle:4.6.0-jdk8

# BUILD
USER root
WORKDIR /usr/src/dipeck_worker
COPY . .
RUN gradle build --no-daemon && \
    mkdir -p /usr/var/dipeck_worker && \
    tar xvf /usr/src/dipeck_worker/build/distributions/dipeck_worker.tar \
        -C /usr/var/dipeck_worker/ \
        --strip-components 1

# RUN
USER gradle
WORKDIR /usr/var/dipeck_worker
ENTRYPOINT ["/usr/var/dipeck_worker/bin/dipeck_worker"]
HEALTHCHECK --interval=5s \
  CMD /usr/src/dipeck_worker/healthcheck.sh
