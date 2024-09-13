# use the official Node.js image
FROM node:16-alpine

# set working directory
WORKDIR /usr/src/app

# copy package.json and install dependencies
COPY package*.json ./

# install dependencies
RUN npm ci --legacy-peer-deps

# copy the rest of the app code
COPY . .

# expose port
EXPOSE 3000

# seed the database before running the app
CMD ["sh", "-c", "npm run seed && npm run start:prod"]
