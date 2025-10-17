# server/Dockerfile

FROM node:18-alpine

WORKDIR /app

# Copy the rest of your application code
COPY . .

# Copy package.json only
COPY package.json ./

# Install dependencies
RUN npm install

# Expose the port
EXPOSE 5050

# Start the application
CMD ["node", "index.js"]