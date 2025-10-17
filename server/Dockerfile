# server/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Set NPM registry to the official NPM registry
RUN npm config set registry https://registry.npmjs.org/

# Clean NPM cache
RUN npm cache clean --force

# Copy package.json only
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port
EXPOSE 5050

# Start the application
CMD ["npx", "index.js"]