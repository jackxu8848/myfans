# MyFans Platform

A content monetization platform similar to Patreon, allowing creators to monetize YouTube videos through individual purchases, bundles, or monthly subscriptions.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Setup

```bash
# Create database
createdb myfans

# Run schema
psql -U postgres -d myfans -f ../database/schema.sql
```

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

Server will run on `http://localhost:3000`

### 4. Frontend Setup

The frontend files are in the root directory. Update them to use the API service instead of localStorage.

## 📁 Project Structure

```
myfans/
├── backend/              # Express.js API server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation middleware
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   └── package.json
├── database/             # Database schema and migrations
│   └── schema.sql
├── frontend/             # Frontend files (to be migrated)
│   └── src/
│       └── js/
│           └── api.js    # API service module
├── ARCHITECTURE.md       # Detailed architecture documentation
├── IMPLEMENTATION_PLAN.md # Implementation roadmap
└── README.md             # This file
```

## 🔑 Features

### For Viewers
- ✅ User registration and authentication
- ✅ Browse all available videos
- ✅ View free videos
- ✅ Purchase individual videos
- ✅ Purchase video bundles
- ✅ Subscribe to creators (monthly subscription)
- ✅ View purchase history

### For Creators
- ✅ Become a creator (switch from viewer mode)
- ✅ Add YouTube videos with pricing
- ✅ Set videos as free or paid
- ✅ Create bundle deals (e.g., "Buy 5 videos for $15")
- ✅ Set up monthly subscription pricing
- ✅ Manage videos (edit price, delete)

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Frontend**: Vanilla JavaScript (can upgrade to React/Vue later)

## 📡 API Endpoints

See `ARCHITECTURE.md` for complete API documentation.

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/users/:id/become-creator` - Become a creator

### Videos
- `GET /api/videos` - Get all videos
- `GET /api/videos/:id` - Get video by ID
- `POST /api/videos` - Create video (creator)
- `PUT /api/videos/:id` - Update video (creator)
- `DELETE /api/videos/:id` - Delete video (creator)

### Purchases
- `GET /api/purchases/has-access/:videoId` - Check access
- `POST /api/purchases/video/:videoId` - Purchase video
- `GET /api/purchases/my-purchases` - Get user's purchases

### Bundles
- `GET /api/bundles/creator/:creatorId` - Get creator's bundles
- `POST /api/bundles` - Create bundle (creator)
- `POST /api/bundles/:id/purchase` - Purchase bundle

### Subscriptions
- `GET /api/subscriptions/creator/:creatorId` - Get subscription plan
- `POST /api/subscriptions` - Create subscription plan (creator)
- `POST /api/subscriptions/:id/subscribe` - Subscribe to creator
- `GET /api/subscriptions/my-subscriptions` - Get user's subscriptions

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
CORS_ORIGIN=http://localhost:8080
```

## 📝 Next Steps

1. **Complete Frontend Migration**: Update frontend files to use API calls
2. **Payment Integration**: Add Stripe for real payments
3. **Testing**: Write unit and integration tests
4. **Deployment**: Deploy to production

See `IMPLEMENTATION_PLAN.md` for detailed roadmap.

## 📄 License

ISC

## 🤝 Contributing

This is a private project. Contributions welcome!

