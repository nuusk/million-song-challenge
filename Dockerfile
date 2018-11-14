FROM alpine

MAINTAINER Poe "piotr.a.ptak@icloud.com"

ENV DEBIAN_FRONTEND noninteractive

RUN apk update \
    && apk add sudo \
    && apk add curl \
    && apk add nodejs-current nodejs-npm

WORKDIR /usr/src/app

# Initialize project, download all packages
COPY package*.json /usr/src/app/
RUN npm install
COPY . /usr/src/app/

# Map the machine port 5000 to our app's port 5000
EXPOSE 5000

CMD ["npm", "start"]

# Bundle app source
VOLUME /usr/src/app