FROM node:18-alpine

# Instalar OpenSSL y herramientas necesarias para certificados SSL
RUN apk add --no-cache openssl

WORKDIR /api

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]

