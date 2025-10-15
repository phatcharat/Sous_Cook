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
        USER[User's Browser]
    end

    subgraph "Web Server"
        NGINX[Nginx Reverse Proxy]
    end

    subgraph "Application Layer"
        FE[React Frontend]
        API[Express.js API Server]
    end

    subgraph "External Services"
        OPENAI[OpenAI API]
        VISION[Google Vision API]
        EDAMAM[Edamam API for Images]
        SPOONACULAR[Spoonacular API for Images]
        G_AUTH[Google Auth]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL Database)]
        STORAGE[Local File Storage]
    end

    USER --> NGINX
    NGINX --> FE
    NGINX --> API
    FE --> API
    API --> OPENAI
    API --> VISION
    API --> EDAMAM
    API --> SPOONACULAR
    API --> G_AUTH
    API --> DB
    API --> STORAGE
```

## Current Architecture

### Current Technology Stack
The application currently uses a traditional three-tier architecture:

```mermaid
graph TB
    subgraph "Presentation Tier (Client)"
        REACT[React.js Frontend]
    end

    subgraph "Application Tier (Server)"
        NGINX[Nginx Reverse Proxy]
        EXPRESS[Express.js Server]
        MULTER[Multer for File Uploads]
        BCRYPT[Bcrypt for Password Encryption]
    end

    subgraph "Data Tier"
        POSTGRES[(PostgreSQL Database on Railway)]
        UPLOADS[Local File System for Avatars]
    end

    subgraph "External APIs"
        OPENAI_API[OpenAI API]
        GVISION[Google Cloud Vision]
        EDAMAM_API[Edamam API]
        SPOONACULAR_API[Spoonacular API]
        GOOGLE_AUTH[Google Auth Library]
    end

    REACT --> NGINX
    NGINX --> EXPRESS
    EXPRESS --> POSTGRES
    EXPRESS --> UPLOADS
    EXPRESS --> OPENAI_API
    EXPRESS --> GVISION
    EXPRESS --> EDAMAM_API
    EXPRESS --> SPOONACULAR_API
    EXPRESS --> GOOGLE_AUTH
```

### Current Container Architecture
```mermaid
graph TB
    subgraph "Docker Environment via docker-compose.yml"
        subgraph "Client Container"
            RC[React App on Port 3000]
        end

        subgraph "Server Container"
            ES[Express Server on Port 5050]
        end

        subgraph "Proxy Container"
            NX[Nginx on Port 80]
        end
    end

    subgraph "External Cloud Database"
      PG_CLOUD[(PostgreSQL on Railway)]
    end

    NX -- "/api" --> ES
    NX -- "/" --> RC
    ES --> PG_CLOUD
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
        APP[App.js Router]

        subgraph "Pages & Main Components"
            HOME[HomePage]
            LOGIN[LoginPage / SignUpPage]
            SEARCH[SearchBar]
            CAMERA[Camera / CameraSearch]
            INGREDIENT[IngredientPreview]
            PREFERENCES[PreferencesPage]
            SUGGESTION[MenuSuggestion]
            DETAIL[MenuDetail]
            FAVORITES[FavoriteMenu]
            HISTORY[HistoryScreen]
            ACCOUNT[UserDataPage / Setting]
            SHOPPING[ShoppingList]
        end

        subgraph "Core Components"
            NAVBAR[Navbar]
        end

        subgraph "Utils"
            AUTH_UTIL[auth.js for User Session]
            STORAGE_UTIL[storageUtils.js for LocalStorage]
        end
    end

    APP --> HOME
    APP --> LOGIN
    APP --> SEARCH
    APP --> CAMERA
    APP --> INGREDIENT
    APP --> PREFERENCES
    APP --> SUGGESTION
    APP --> DETAIL
    APP --> FAVORITES
    APP --> HISTORY
    APP --> ACCOUNT
    APP --> SHOPPING

    HOME --> NAVBAR
    FAVORITES --> NAVBAR
    HISTORY --> NAVBAR
    ACCOUNT --> NAVBAR

    SEARCH --> STORAGE_UTIL
    INGREDIENT --> STORAGE_UTIL
    PREFERENCES --> STORAGE_UTIL
    LOGIN --> AUTH_UTIL
```

### Backend Service Architecture
```mermaid
graph TB
    subgraph "Express API Server (index.js)"
        ROUTER[API Endpoints]

        subgraph "Route Handlers"
            USER_AUTH[User Auth (Signup, Login, Google)]
            USER_MGMT[User Management (CRUD)]
            MENU_REC[Menu Recommendation]
            IMAGE_PROC[Image Processing (Upload, Detect)]
            DB_OPS[Database Operations (Favorites, History, Menus)]
        end

        subgraph "Middleware & Libraries"
            CORS[CORS]
            MULTER[Multer for File Upload]
            PG[node-postgres for DB connection]
            BCRYPT[Bcrypt for Hashing]
        end

        subgraph "External API Clients"
            OPENAI_CLIENT[OpenAI]
            GOOGLE_VISION[Google Cloud Vision]
            AXIOS[Axios for Edamam/Spoonacular]
            GOOGLE_AUTH_LIB[Google Auth Library]
        end
    end

    ROUTER --> USER_AUTH
    ROUTER --> USER_MGMT
    ROUTER --> MENU_REC
    ROUTER --> IMAGE_PROC
    ROUTER --> DB_OPS

    USER_AUTH --> BCRYPT
    USER_AUTH --> GOOGLE_AUTH_LIB
    USER_MGMT --> MULTER
    DB_OPS --> PG
    MENU_REC --> OPENAI_CLIENT
    IMAGE_PROC --> GOOGLE_VISION
    IMAGE_PROC --> OPENAI_CLIENT
```

## Data Flow Diagrams

### Recipe Recommendation Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Server
    participant OpenAI
    participant Database

    User->>Frontend: ใส่ชื่อวัตถุดิบ, เลือกความชอบ
    Frontend->>API Server: POST /api/menu-recommendations with ingredients & preferences
    API Server->>OpenAI: ส่ง Prompt พร้อมข้อมูลวัตถุดิบและความชอบ
    OpenAI-->>API Server: ตอบกลับเป็น JSON ที่มีสูตรอาหารหลายรายการ
    API Server->>Database: บันทึก/อัปเดตสูตรอาหารที่ได้ลงในตาราง 'menus'
    Database-->>API Server: ยืนยันการบันทึกและคืน menu_id
    API Server-->>Frontend: ส่งข้อมูลสูตรอาหารพร้อมรูปภาพและ menu_id
    Frontend->>User: แสดงผลสูตรอาหารที่แนะนำ
```

### User Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API Server
    participant Database

    User->>Frontend: กรอก Username และ Password
    Frontend->>API Server: POST /login with credentials
    API Server->>Database: SELECT user WHERE username = ?
    Database-->>API Server: คืนข้อมูล user ที่มี password_hash
    API Server->>API Server: ใช้ bcrypt เปรียบเทียบรหัสผ่าน
    API Server-->>Frontend: ตอบกลับพร้อม user_id และข้อความยืนยัน
    Frontend->>Frontend: บันทึก user_id ลง LocalStorage
    Frontend->>User: นำทางไปยังหน้า HomePage
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
            HTTPS[HTTPS/TLS via Nginx]
        end

        subgraph "Authentication & Authorization"
            BCRYPT[Bcrypt for Password Hashing]
            GOOGLE_AUTH[Google Sign-In (OAuth 2.0)]
        end

        subgraph "Data Security"
            PARAM_VALIDATION[Server-side Input Validation]
        end

        subgraph "Application Security"
            CORS[CORS Policy]
            MULTER_VALIDATION[File Type & Size Validation]
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
