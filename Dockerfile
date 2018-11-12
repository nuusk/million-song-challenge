FROM node

WORKDIR /usr/src/app

# Initialize project, download all packages
COPY package*.json /usr/src/app/
RUN npm install

# Map the machine port 5000 to our app's port 5000
EXPOSE 5000

CMD ["npm", "start"]

# Bundle app source
VOLUME /usr/src/app