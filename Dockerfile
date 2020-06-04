FROM node:12.16.3
WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
CMD [ "node", "index.js" ]


