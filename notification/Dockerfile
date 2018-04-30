FROM node:9.11

WORKDIR /usr/src

COPY package.json .
RUN npm install

COPY . .

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
HEALTHCHECK CMD ./healthcheck.js
