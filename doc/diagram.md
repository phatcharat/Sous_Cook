# Sous Cook - System Design & Architecture

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Current Architecture](#current-architecture)
3. [Target Firebase Architecture](#target-firebase-architecture)
4. [Component Architecture](#component-architecture)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Security Architecture](#security-architecture)

## High-Level Architecture

### System Overview
Sous Cook is a modern web application designed with a microservices-oriented architecture that provides recipe recommendations based on available ingredients. The system is designed to be scalable, maintainable, and user-friendly.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser]
        PWA[Progressive Web App]
        MOB[Mobile Browser]
    end
    
    subgraph "CDN & Load Balancing"
        CDN[Content Delivery Network]
        LB[Load Balancer]
    end
    
    subgraph "Application Layer"
        FE[React Frontend]
        API[Express.js API Server]
        AUTH[Authentication Service]
    end
    
    subgraph "External Services"
        VISION[Google Vision API]
        NUTRITION[Nutrition Database API]
        DELIVERY[Delivery Service APIs]
        SOCIAL[Social Login Providers]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        STORAGE[File Storage]
        CACHE[Redis Cache]
    end
    
    WEB --> CDN
    PWA --> CDN
    MOB --> CDN
    CDN --> LB
    LB --> FE
    FE --> API
    API --> AUTH
    API --> VISION
    API --> NUTRITION
    API --> DELIVERY
    AUTH --> SOCIAL
    API --> DB
    API --> STORAGE
    API --> CACHE
```

## Current Architecture

### Current Technology Stack
The application currently uses a traditional three-tier architecture:

```mermaid
graph TB
    subgraph "Presentation Tier"
        REACT[React.js Frontend]
        NGINX[Nginx Reverse Proxy]
    end
    
    subgraph "Application Tier"
        EXPRESS[Express.js Server]
        MULTER[File Upload Handler]
        BCRYPT[Password Encryption]
    end
    
    subgraph "Data Tier"
        POSTGRES[(PostgreSQL Database)]
        UPLOADS[Local File Storage]
    end
    
    subgraph "External APIs"
        OPENAI[OpenAI API]
        GVISION[Google Cloud Vision]
    end
    
    REACT --> NGINX
    NGINX --> EXPRESS
    EXPRESS --> POSTGRES
    EXPRESS --> UPLOADS
    EXPRESS --> OPENAI
    EXPRESS --> GVISION
```

### Current Container Architecture
```mermaid
graph TB
    subgraph "Docker Environment"
        subgraph "Client Container"
            RC[React App :3000]
        end
        
        subgraph "Server Container"
            ES[Express Server :5050]
        end
        
        subgraph "Database Container"
            PG[PostgreSQL :5433]
        end
        
        subgraph "Proxy Container"
            NX[Nginx :80]
        end
    end
    
    NX --> RC
    NX --> ES
    ES --> PG
```

## Target Firebase Architecture

### Firebase Migration Architecture
The target architecture leverages Firebase services for improved scalability and reduced infrastructure management:

```mermaid
graph TB
    subgraph "Client Applications"
        WEB[Web App]
        PWA[PWA]
        MOBILE[Mobile App]
    end
    
    subgraph "Firebase Services"
        HOSTING[Firebase Hosting]
        AUTH[Firebase Authentication]
        FIRESTORE[(Cloud Firestore)]
        STORAGE[Firebase Storage]
        FUNCTIONS[Cloud Functions]
        ANALYTICS[Firebase Analytics]
    end
    
    subgraph "External Services"
        VISION[Google Vision API]
        NUTRITION[Nutrition APIs]
        DELIVERY[Delivery APIs]
        PAYMENT[Payment Gateway]
    end
    
    WEB --> HOSTING
    PWA --> HOSTING
    MOBILE --> HOSTING
    
    HOSTING --> AUTH
    HOSTING --> FIRESTORE
    HOSTING --> STORAGE
    HOSTING --> FUNCTIONS
    HOSTING --> ANALYTICS
    
    FUNCTIONS --> VISION
    FUNCTIONS --> NUTRITION
    FUNCTIONS --> DELIVERY
    FUNCTIONS --> PAYMENT
```

## Component Architecture

### Frontend Component Structure
```mermaid
graph TB
    subgraph "React Application"
        APP[App.js]
        
        subgraph "Pages"
            HOME[Home Page]
            SEARCH[Search Page]
            RECIPE[Recipe Details]
            PROFILE[User Profile]
            COMMUNITY[Community Feed]
        end
        
        subgraph "Components"
            HEADER[Header/Navigation]
            INGREDIENT[Ingredient Input]
            RECIPECARD[Recipe Card]
            REVIEW[Review Component]
            CAMERA[Camera Component]
        end
        
        subgraph "Utils"
            API[API Client]
            AUTH_UTIL[Auth Utils]
            STORAGE_UTIL[Storage Utils]
        end
    end
    
    APP --> HOME
    APP --> SEARCH
    APP --> RECIPE
    APP --> PROFILE
    APP --> COMMUNITY
    
    HOME --> HEADER
    HOME --> INGREDIENT
    HOME --> RECIPECARD
    
    RECIPE --> REVIEW
    SEARCH --> CAMERA
    
    INGREDIENT --> API
    RECIPECARD --> API
    REVIEW --> API
    
    API --> AUTH_UTIL
    API --> STORAGE_UTIL
```

### Backend Service Architecture
```mermaid
graph TB
    subgraph "API Server"
        ROUTER[Express Router]
        
        subgraph "Controllers"
            USER_CTRL[User Controller]
            RECIPE_CTRL[Recipe Controller]
            INGREDIENT_CTRL[Ingredient Controller]
            REVIEW_CTRL[Review Controller]
            COMMUNITY_CTRL[Community Controller]
        end
        
        subgraph "Services"
            AUTH_SVC[Authentication Service]
            RECIPE_SVC[Recipe Service]
            NUTRITION_SVC[Nutrition Service]
            IMAGE_SVC[Image Processing Service]
            NOTIFICATION_SVC[Notification Service]
        end
        
        subgraph "Data Access"
            USER_DAO[User DAO]
            RECIPE_DAO[Recipe DAO]
            REVIEW_DAO[Review DAO]
        end
    end
    
    ROUTER --> USER_CTRL
    ROUTER --> RECIPE_CTRL
    ROUTER --> INGREDIENT_CTRL
    ROUTER --> REVIEW_CTRL
    ROUTER --> COMMUNITY_CTRL
    
    USER_CTRL --> AUTH_SVC
    RECIPE_CTRL --> RECIPE_SVC
    INGREDIENT_CTRL --> NUTRITION_SVC
    RECIPE_CTRL --> IMAGE_SVC
    COMMUNITY_CTRL --> NOTIFICATION_SVC
    
    AUTH_SVC --> USER_DAO
    RECIPE_SVC --> RECIPE_DAO
    NOTIFICATION_SVC --> REVIEW_DAO
```

## Data Flow Diagrams

### Recipe Recommendation Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant AI_Service
    participant Database
    participant External_APIs
    
    User->>Frontend: Input ingredients
    Frontend->>API: POST /api/ingredients/detect
    API->>AI_Service: Process ingredients
    AI_Service->>Database: Query recipes
    Database->>AI_Service: Return matching recipes
    AI_Service->>External_APIs: Get nutrition data
    External_APIs->>AI_Service: Return nutrition info
    AI_Service->>API: Ranked recipe suggestions
    API->>Frontend: Recipe recommendations
    Frontend->>User: Display recipes
```

### User Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Firebase_Auth
    participant API
    participant Database
    
    User->>Frontend: Login request
    Frontend->>Firebase_Auth: Authenticate user
    Firebase_Auth->>Frontend: Return auth token
    Frontend->>API: API request with token
    API->>Firebase_Auth: Verify token
    Firebase_Auth->>API: Token valid
    API->>Database: Query user data
    Database->>API: Return user profile
    API->>Frontend: User data
    Frontend->>User: Display dashboard
```

### Community Sharing Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Storage
    participant Database
    participant Community
    
    User->>Frontend: Upload dish photo
    Frontend->>API: POST /api/community/share
    API->>Storage: Store image
    Storage->>API: Return image URL
    API->>Database: Save post data
    Database->>API: Confirm save
    API->>Community: Notify followers
    Community->>API: Broadcast update
    API->>Frontend: Success response
    Frontend->>User: Confirm post shared
```

## Database Design

### Entity Relationship Diagram
```mermaid
erDiagram
    USERS ||--o{ RECIPES : creates
    USERS ||--o{ REVIEWS : writes
    USERS ||--o{ USER_PREFERENCES : has
    USERS ||--o{ USER_ALLERGIES : has
    USERS ||--o{ COOKING_HISTORY : tracks
    USERS ||--o{ COMMUNITY_POSTS : shares
    
    RECIPES ||--o{ RECIPE_INGREDIENTS : contains
    RECIPES ||--o{ REVIEWS : receives
    RECIPES ||--o{ RECIPE_NUTRITION : has
    RECIPES ||--o{ COOKING_TIPS : includes
    
    INGREDIENTS ||--o{ RECIPE_INGREDIENTS : used_in
    INGREDIENTS ||--o{ USER_PANTRY : stored_in
    
    REVIEWS ||--o{ REVIEW_IMAGES : includes
    COMMUNITY_POSTS ||--o{ POST_COMMENTS : receives
    
    USERS {
        uuid user_id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        timestamp created_at
        timestamp updated_at
        boolean email_verified
        string profile_image_url
    }
    
    RECIPES {
        uuid recipe_id PK
        uuid created_by FK
        string title
        text description
        integer prep_time
        integer cook_time
        integer servings
        string difficulty_level
        string cuisine_type
        text instructions
        string image_url
        timestamp created_at
        timestamp updated_at
    }
    
    INGREDIENTS {
        uuid ingredient_id PK
        string name UK
        string category
        string unit_type
        text description
        timestamp created_at
    }
```

## API Design

### RESTful API Endpoints

#### Authentication Endpoints
```
POST   /api/auth/register          - User registration
POST   /api/auth/login             - User login
POST   /api/auth/logout            - User logout
POST   /api/auth/refresh           - Refresh token
POST   /api/auth/forgot-password   - Password reset request
POST   /api/auth/reset-password    - Password reset confirmation
```

#### User Management Endpoints
```
GET    /api/users/profile          - Get user profile
PUT    /api/users/profile          - Update user profile
GET    /api/users/preferences      - Get user preferences
PUT    /api/users/preferences      - Update user preferences
GET    /api/users/allergies        - Get user allergies
PUT    /api/users/allergies        - Update user allergies
GET    /api/users/history          - Get cooking history
```

#### Recipe Endpoints
```
GET    /api/recipes                - Get recipes (with filters)
GET    /api/recipes/:id            - Get specific recipe
POST   /api/recipes                - Create new recipe
PUT    /api/recipes/:id            - Update recipe
DELETE /api/recipes/:id            - Delete recipe
POST   /api/recipes/recommend      - Get recipe recommendations
GET    /api/recipes/:id/nutrition  - Get recipe nutrition
GET    /api/recipes/:id/tips       - Get cooking tips
```

#### Ingredient Endpoints
```
GET    /api/ingredients            - Get all ingredients
POST   /api/ingredients/detect     - Detect ingredients from image
GET    /api/ingredients/search     - Search ingredients
POST   /api/ingredients/pantry     - Add to user pantry
GET    /api/ingredients/pantry     - Get user pantry
DELETE /api/ingredients/pantry/:id - Remove from pantry
```

#### Community Endpoints
```
GET    /api/community/feed         - Get community feed
POST   /api/community/posts        - Create new post
GET    /api/community/posts/:id    - Get specific post
POST   /api/community/posts/:id/like - Like/unlike post
POST   /api/community/posts/:id/comment - Add comment
GET    /api/community/users/:id/posts - Get user's posts
```

## Security Architecture

### Security Layers
```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            HTTPS[HTTPS/TLS 1.3]
            FIREWALL[Web Application Firewall]
            DDOS[DDoS Protection]
        end
        
        subgraph "Authentication & Authorization"
            JWT[JWT Tokens]
            OAUTH[OAuth 2.0]
            RBAC[Role-Based Access Control]
            MFA[Multi-Factor Authentication]
        end
        
        subgraph "Data Security"
            ENCRYPTION[Data Encryption at Rest]
            HASHING[Password Hashing]
            SANITIZATION[Input Sanitization]
            VALIDATION[Data Validation]
        end
        
        subgraph "Application Security"
            CORS[CORS Policy]
            CSP[Content Security Policy]
            RATE_LIMIT[Rate Limiting]
            AUDIT[Audit Logging]
        end
    end
```

### Data Protection Flow
```mermaid
graph LR
    INPUT[User Input] --> VALIDATE[Input Validation]
    VALIDATE --> SANITIZE[Data Sanitization]
    SANITIZE --> ENCRYPT[Encryption]
    ENCRYPT --> STORE[(Secure Storage)]
    
    STORE --> DECRYPT[Decryption]
    DECRYPT --> AUTHORIZE[Authorization Check]
    AUTHORIZE --> OUTPUT[Secure Output]
```

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Architecture Review Date:** March 2025
