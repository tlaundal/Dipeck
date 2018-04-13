FROM gradle:4.6.0-jdk8

USER root

WORKDIR /usr/var/dipeck_worker
WORKDIR /usr/src/dipeck_worker
# COPY build.gradle .
# COPY settings.gradle .
# RUN gradle assemble --no-daemon

COPY . .
RUN gradle build --no-daemon && \
    tar xvf /usr/src/dipeck_worker/build/distributions/dipeck_worker.tar \
        -C /usr/var/dipeck_worker/ \
        --strip-components 1
# --offline

WORKDIR /usr/var/dipeck_worker
RUN chown gradle:gradle /usr/var/dipeck_worker
USER gradle

ENV DIPECK_MQ_HOST ''
ENV DIPECK_MQ_PORT 5672
ENV DIPECK_MQ_USER ''
ENV DIPECK_MQ_PASS ''

ENTRYPOINT ["/usr/var/dipeck_worker/bin/dipeck_worker"]
