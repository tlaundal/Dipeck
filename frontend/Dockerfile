FROM nginx

RUN rm /etc/nginx/conf.d/*.conf

COPY ./nginx.conf /etc/nginx/conf.d/dipeck.conf
COPY ./src /srv/dipeck
