# server/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy package.json only
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port
EXPOSE 5050

# Start the application
CMD ["node", "index.js"]