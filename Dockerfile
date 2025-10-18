# Stage 1: Build the React client
FROM node:18-alpine AS client-builder

# Install python and build tools (needed for some npm packages)
RUN apk add --no-cache python3 make g++

WORKDIR /app/client

# Copy client package files FIRST
COPY client/package*.json ./

# Install client dependencies
RUN npm cache clean --force && \
    npm install --legacy-peer-deps

# THEN copy the rest of client source
COPY client/ ./

# Build the React app
RUN npm run build

# Stage 2: Setup the server
FROM node:18-alpine

# Install python and build tools for server dependencies (sharp, bcrypt, etc.)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

# Copy server package files FIRST
COPY server/package*.json ./

# Install server dependencies
RUN npm cache clean --force && \
    npm install --production --legacy-peer-deps

# THEN copy the rest of server source
COPY server/ ./

# Copy the built client from stage 1
COPY --from=client-builder /app/client/build ./client_build

# Create upload directories
RUN mkdir -p uploads/avatars uploads/community uploads/crop

# Set environment variable for production
ENV NODE_ENV=production

# Expose port
EXPOSE 5050

# Start the server
CMD ["node", "index.js"]