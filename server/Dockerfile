# server/Dockerfile

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port
EXPOSE 5050

# Use nodemon for development (watching files for changes)
CMD ["npx", "nodemon", "index.js"]
