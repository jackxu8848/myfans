# MyFans Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker run --name myfans-db -e POSTGRES_PASSWORD=your_password -e POSTGRES_DB=myfans -p 5432:5432 -d postgres:15
```

#### Option B: Local PostgreSQL Installation
1. Install PostgreSQL on your system
2. Create database:
```sql
CREATE DATABASE myfans;
```

### 3. Run Database Migrations
```bash
psql -U postgres -d myfans -f ../database/schema.sql
```

Or use the migration script:
```bash
npm run migrate
```

### 4. Environment Configuration
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secret.

### 5. Run the Server

Development (with hot reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/users/:id/become-creator` - Convert to creator (requires auth)

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `GET /api/videos/creator/:creatorId` - Get videos by creator
- `POST /api/videos` - Create video (creator only)
- `PUT /api/videos/:id` - Update video (creator only)
- `DELETE /api/videos/:id` - Delete video (creator only)

## Testing the API

### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Get Videos (Public)
```bash
curl http://localhost:3000/api/videos
```

### Create Video (Requires Auth Token)
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "youtubeVideoId":"dQw4w9WgXcQ",
    "youtubeUrl":"https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "title":"Test Video",
    "thumbnailUrl":"https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg",
    "price":5.99
  }'
```

## Next Steps

1. Implement purchase endpoints
2. Implement bundle endpoints
3. Implement subscription endpoints
4. Add Stripe payment integration
5. Add email notifications
6. Add file upload for thumbnails (optional)

