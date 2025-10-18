# Stage 1: Server
FROM node:18-alpine

# Install python and build tools for server dependencies (sharp, bcrypt, etc.)
RUN apk add --no-cache python3 make g++ cairo-dev jpeg-dev pango-dev giflib-dev

WORKDIR /app

# Copy server package files
COPY server/package*.json ./

# Install server dependencies
RUN npm cache clean --force && \
    npm install --production --legacy-peer-deps

# Copy server source
COPY server/ ./

# Copy pre-built React client
COPY client/build ./client_build

# Create upload directories
RUN mkdir -p uploads/avatars uploads/community uploads/crop

# Set environment variable for production
ENV NODE_ENV=production

# Expose port
EXPOSE 5050

# Start the server
CMD ["node", "index.js"]
