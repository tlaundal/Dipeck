FROM node:9.11

COPY package.json .
RUN npm install

COPY . .

EXPOSE 8080

ENTRYPOINT ["npm", "start"]
