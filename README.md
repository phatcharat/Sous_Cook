# Sous Cook

A digital cooking assistant application designed to help you manage recipes, meal planning, and cooking workflows.

### Environment Setup

Before running the application, create environment files for both client and server:

```bash
# Clone and navigate to the project
git clone https://github.com/SaCHiMiJi/Sous_Cook.git
cd Sous_Cook

# Create client environment file
cp client/.env.example client/.env

# Create server environment file  
cp server/.env.example server/.env
```

Edit the `client/.env` file:

```bash
# client/.env
REACT_APP_BACKEND_URL=http://localhost:5050/api
REACT_APP_ENV=production
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_key_here
```

Edit the `server/.env` file:

```bash
# server/.env
NODE_ENV=production
PORT=5050
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLOUD_VISION_API_KEY=your_google_vision_api_key_here <optional no use>
EDAMAN_APP_ID=your_edamam_app_id_here
EDAMAN_API_KEY=your_edamam_api_key_here
SPOONACULAR_API_KEY=your_spoonacular_api_key_here
```

### Running the Application

```bash
# Start the application
docker-compose up -d
```

That's it! The application will be available at `http://localhost:3000`

### Accessing the Application

Once the containers are running, you can access the application at:

**Client (React App):** `http://localhost:3000`  
**Server API:** `http://localhost:5050`  
**Nginx (Load Balancer):** `http://localhost:80`

### Stopping the Application

When you're done, you can stop the application with:
```bash
docker-compose down
```

## 📋 Additional Commands

If you need to troubleshoot your setup, here are some useful commands:

```bash
# View application logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Update to latest version
docker-compose pull && docker-compose up -d
```



## 🔧 Docker Compose Configuration

The application uses a multi-service architecture with client, server, and nginx. Here's the `docker-compose.yml` structure:

```yaml
version: '3.9'

services:
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    volumes:
      - ./client:/app
      - /app/node_modules
    stdin_open: true
    tty: true
    environment:
      - NODE_ENV=production
      - CHOKIDAR_USEPOLLING=true
    env_file:
      - ./client/.env
    networks:
      - webnet

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
    ports:
      - '5050:5050'
    volumes:
      - ./server:/app
      - /app/node_modules
    env_file:
      - ./server/.env
    networks:
      - webnet
    command: ["npx", "nodemon", "index.js"]

  nginx:
    image: nginx:latest
    container_name: nginx
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    ports:
      - '80:80'
    depends_on:
      - client
      - server
    networks:
      - webnet

networks:
  webnet:
```

## 🛠 Development

### Local Development without Docker

```bash
# Clone the repository
git clone https://github.com/SaCHiMiJi/Sous_Cook.git
cd Sous_Cook

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📖 API Documentation

The application provides a RESTful API for integration with other services:

- `GET /api/recipes` - List all recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

## 🆘 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Find what's using port 3000
lsof -i :3000
```

**Container won't start**
```bash
# Check logs for errors
docker-compose logs
```

---

**Happy Cooking! 👨‍🍳👩‍🍳**
