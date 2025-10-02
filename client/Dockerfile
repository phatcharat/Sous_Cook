# client/Dockerfile

# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set development mode for better logging during development
ENV NODE_ENV=production

# Build the React application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the React application
CMD ["npm", "start"]
