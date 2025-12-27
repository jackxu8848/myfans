# MyFans Platform Architecture

## Overview
MyFans is a content monetization platform similar to Patreon, allowing creators to monetize YouTube videos through individual purchases, bundles, or monthly subscriptions.

## Technology Stack

### Frontend
- **Framework**: Vanilla JavaScript (can upgrade to React/Vue later)
- **Styling**: CSS (existing files)
- **Build Tool**: (Optional) Webpack/Vite for production builds

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: JavaScript/TypeScript

### Database
- **Primary DB**: PostgreSQL
- **ORM/Query Builder**: Prisma or Sequelize (or raw SQL with pg)

### Authentication
- **Method**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Session Management**: Stateless JWT tokens

### Payment Processing (Future)
- **Integration**: Stripe API
- **Webhooks**: For subscription management

### Deployment
- **Hosting**: AWS, Heroku, DigitalOcean, or Vercel/Netlify (frontend) + Railway/Render (backend)
- **Container**: Docker (optional but recommended)

## Database Schema

### Tables

#### `users`
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique, Not Null)
- `password_hash` (VARCHAR, Not Null)
- `name` (VARCHAR, Not Null)
- `is_creator` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `videos`
- `id` (UUID, Primary Key)
- `creator_id` (UUID, Foreign Key → users.id)
- `youtube_video_id` (VARCHAR, Not Null)
- `youtube_url` (VARCHAR, Not Null)
- `title` (VARCHAR, Not Null)
- `thumbnail_url` (VARCHAR)
- `price` (DECIMAL(10,2), Default: 0.00)
- `is_free` (BOOLEAN, Computed from price = 0)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `purchases`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `video_id` (UUID, Foreign Key → videos.id)
- `purchase_type` (ENUM: 'individual', 'bundle', 'subscription')
- `amount_paid` (DECIMAL(10,2))
- `transaction_id` (VARCHAR, Nullable - for payment processor)
- `created_at` (TIMESTAMP)

#### `bundles`
- `id` (UUID, Primary Key)
- `creator_id` (UUID, Foreign Key → users.id)
- `name` (VARCHAR, Optional)
- `video_count` (INTEGER, Not Null)
- `price` (DECIMAL(10,2), Not Null)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `bundle_purchases`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `bundle_id` (UUID, Foreign Key → bundles.id)
- `selected_video_ids` (UUID[], Array of video IDs)
- `amount_paid` (DECIMAL(10,2))
- `transaction_id` (VARCHAR, Nullable)
- `created_at` (TIMESTAMP)

#### `subscriptions`
- `id` (UUID, Primary Key)
- `creator_id` (UUID, Foreign Key → users.id)
- `monthly_price` (DECIMAL(10,2), Not Null)
- `is_active` (BOOLEAN, Default: true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### `user_subscriptions`
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `subscription_id` (UUID, Foreign Key → subscriptions.id)
- `status` (ENUM: 'active', 'cancelled', 'expired')
- `current_period_start` (TIMESTAMP)
- `current_period_end` (TIMESTAMP)
- `stripe_subscription_id` (VARCHAR, Nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout (client-side token removal)
- `GET /api/auth/me` - Get current user info
- `PUT /api/users/:id/become-creator` - Convert user to creator

### Videos
- `GET /api/videos` - Get all videos (public)
- `GET /api/videos/:id` - Get specific video
- `GET /api/videos/creator/:creatorId` - Get videos by creator
- `POST /api/videos` - Create video (creator only)
- `PUT /api/videos/:id` - Update video (creator only)
- `DELETE /api/videos/:id` - Delete video (creator only)

### Purchases
- `POST /api/purchases/video/:videoId` - Purchase individual video
- `GET /api/purchases/my-purchases` - Get user's purchases
- `GET /api/purchases/has-access/:videoId` - Check if user has access

### Bundles
- `GET /api/bundles/creator/:creatorId` - Get creator's bundles
- `POST /api/bundles` - Create bundle (creator only)
- `PUT /api/bundles/:id` - Update bundle (creator only)
- `DELETE /api/bundles/:id` - Delete bundle (creator only)
- `POST /api/bundles/:id/purchase` - Purchase bundle

### Subscriptions
- `GET /api/subscriptions/creator/:creatorId` - Get creator's subscription info
- `POST /api/subscriptions` - Create subscription plan (creator only)
- `PUT /api/subscriptions/:id` - Update subscription plan (creator only)
- `POST /api/subscriptions/:id/subscribe` - Subscribe to creator
- `DELETE /api/subscriptions/:id/unsubscribe` - Cancel subscription
- `GET /api/subscriptions/my-subscriptions` - Get user's active subscriptions

## Folder Structure

```
myfans/
├── frontend/              # Client-side code
│   ├── public/
│   ├── src/
│   │   ├── js/
│   │   ├── css/
│   │   └── html/
│   └── package.json
│
├── backend/               # Server-side code
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── utils/         # Helper functions
│   │   └── server.js      # Entry point
│   ├── prisma/            # Database schema (if using Prisma)
│   ├── migrations/        # Database migrations
│   ├── .env.example
│   └── package.json
│
├── database/              # SQL scripts
│   ├── schema.sql
│   └── seeds.sql
│
├── docker/                # Docker configurations
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── docs/                  # Documentation
│   └── API.md
│
└── README.md
```

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token rotation
   - Password hashing with bcrypt (salt rounds: 10+)

2. **Authorization**
   - Role-based access control (creator vs viewer)
   - Resource ownership verification
   - Middleware for protected routes

3. **Data Validation**
   - Input sanitization
   - SQL injection prevention (parameterized queries)
   - XSS protection
   - CSRF tokens for state-changing operations

4. **API Security**
   - Rate limiting
   - CORS configuration
   - HTTPS only in production
   - Environment variables for secrets

## Payment Integration (Future)

1. **Stripe Integration**
   - Individual payments
   - Recurring subscriptions
   - Webhook handling for payment events
   - Customer portal for subscription management

2. **Transaction Tracking**
   - All purchases logged in database
   - Payment status tracking
   - Refund handling

## Deployment Strategy

1. **Development**
   - Local PostgreSQL instance
   - Nodemon for hot reload
   - Environment variables in .env

2. **Staging**
   - Separate database
   - Test payment processing
   - Full integration testing

3. **Production**
   - Managed PostgreSQL (AWS RDS, Supabase, etc.)
   - SSL certificates
   - CDN for static assets
   - Monitoring and logging (Sentry, LogRocket)

## Migration Path from Current Code

1. **Phase 1**: Set up backend infrastructure
   - Database setup
   - Basic API endpoints
   - Authentication

2. **Phase 2**: Migrate data models
   - Move from localStorage to database
   - Update frontend API calls
   - Test all functionality

3. **Phase 3**: Add payment processing
   - Stripe integration
   - Webhook handlers
   - Subscription management

4. **Phase 4**: Production deployment
   - Environment setup
   - Security hardening
   - Performance optimization

