FROM nginx

RUN apt-get update && apt-get install -y curl jq && rm -rf /var/lib/apt/lists/*

RUN rm /etc/nginx/conf.d/*.conf

COPY ./nginx.conf /etc/nginx/conf.d/dipeck.conf
COPY ./src /srv/dipeck
COPY healthcheck.sh .

HEALTHCHECK CMD ./healthcheck.sh
