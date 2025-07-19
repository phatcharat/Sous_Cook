# Sous_Cook

A digital cooking assistant application designed to help you manage recipes, meal planning, and cooking workflows.

## Quick Start with Docker

### Prerequisites

- Docker installed on your system
- Docker Compose installed on your system

### Running the Application

```bash
# Clone and navigate to the project
git clone https://github.com/SaCHiMiJi/Sous_Cook.git
cd Sous_Cook

# Start the application
docker-compose up -d
```

That's it! The application will be available at `http://localhost:3000`

### Accessing the Application

Once the container is running, open your web browser and navigate to:
```
http://localhost:3000
```

### Stopping the Application

When you're done, you can stop the application with:
```bash
docker-compose down
```

## 🔧 Configuration



### Customization (Optional)

You can customize the application by creating a `.env` file in your project root:

```bash
# .env file
JWT_SECRET=your-super-secret-key
POSTGRES_PASSWORD=secure-password
```

## 📋 Additional Commands (Optional)

If you need to troubleshoot or customize your setup, here are some useful commands:

```bash
# View application logs
docker-compose logs -f

# Restart the application
docker-compose restart

# Update to latest version
docker-compose pull && docker-compose up -d
```



## 🔧 Docker Compose Configuration

The application uses a multi-service architecture defined in `docker-compose.yml`:

```yaml
version: '3.8'
services:
  sous-cook:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@database:5432/sous_cook
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/app/data
    depends_on:
      - database
      - redis

  database:
    image: postgres:15
    environment:
      - POSTGRES_DB=sous_cook
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
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

### Building Custom Images

```bash
# Build with custom tag
docker build -t my-sous-cook:v1.0 .

# Build with build arguments
docker build --build-arg NODE_VERSION=18 -t sous-cook .
```

## 📖 API Documentation

The application provides a RESTful API for integration with other services:

- `GET /api/recipes` - List all recipes
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe

For detailed API documentation, visit `/api/docs` when the application is running.

## 🔒 Security

- Change default JWT secret in production
- Use HTTPS in production environments
- Regularly update Docker images
- Backup your data regularly

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
