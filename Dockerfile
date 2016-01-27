FROM node:0.12.7-wheezy

MAINTAINER erhu "lazio10000@gmail.com"

WORKDIR /app

COPY ./package.json /app/

RUN npm install

COPY . /app/

EXPOSE 3000

CMD node index