# Getting Started with MyFans Platform

## Overview

I've created a complete full-stack architecture for your MyFans platform. Here's what has been set up:

## ✅ What's Been Created

### 1. **Architecture Documentation**
- `ARCHITECTURE.md` - Complete system design, database schema, API structure
- `IMPLEMENTATION_PLAN.md` - Step-by-step implementation roadmap
- `GETTING_STARTED.md` - This file

### 2. **Database**
- `database/schema.sql` - Complete PostgreSQL schema with all tables:
  - Users table
  - Videos table
  - Purchases table
  - Bundles table
  - Bundle purchases table
  - Subscriptions table
  - User subscriptions table

### 3. **Backend API (Express.js)**
Complete REST API with:

#### Authentication System
- User registration with password hashing (bcrypt)
- User login with JWT tokens
- Become creator functionality
- Protected routes with authentication middleware

#### Video Management
- Get all videos
- Get video by ID
- Get videos by creator
- Create video (creator only)
- Update video (creator only)
- Delete video (creator only)

#### Purchase System
- Check video access
- Purchase individual videos
- Get user's purchase history

#### Bundle System
- Get creator's bundles
- Create bundles (creator)
- Update bundles (creator)
- Delete bundles (creator)
- Purchase bundles

#### Subscription System
- Get creator's subscription plan
- Create subscription plans (creator)
- Update subscription plans (creator)
- Subscribe to creators
- Cancel subscriptions
- Get user's active subscriptions

### 4. **Frontend API Service**
- `frontend/src/js/api.js` - Ready-to-use API service module
- All API calls organized by feature
- Token management included

## 🚀 Quick Start Guide

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE myfans;

# Exit psql
\q
```

### Step 3: Set Up Backend

```bash
cd backend
npm install
```

### Step 4: Configure Environment

Create `backend/.env` file:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/myfans
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

**Important:** Replace `your_postgres_password` with your actual PostgreSQL password, and change `JWT_SECRET` to a random secure string.

### Step 5: Run Database Schema

```bash
psql -U postgres -d myfans -f ../database/schema.sql
```

### Step 6: Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
Connected to PostgreSQL database
Server running on port 3000
Environment: development
```

### Step 7: Test the API

**Register a user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the token from the response, then test authenticated endpoint:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 📋 Next Steps

### 1. Update Frontend to Use API

The frontend currently uses localStorage. You need to:

1. Include the API service in your HTML:
```html
<script type="module" src="src/js/api.js"></script>
```

2. Replace localStorage calls with API calls:
```javascript
// Old way (localStorage)
const videos = JSON.parse(localStorage.getItem('myfans_videos'));

// New way (API)
import { videosAPI } from './src/js/api.js';
const videos = await videosAPI.getAllVideos();
```

3. Update authentication:
```javascript
// Old way
localStorage.setItem('myfans_current_user', JSON.stringify(user));

// New way
import { authAPI } from './src/js/api.js';
const response = await authAPI.login(email, password);
// Token is automatically saved
```

### 2. Test All Features

Test each feature systematically:
- [ ] User registration
- [ ] User login
- [ ] Become creator
- [ ] Add video
- [ ] Edit video
- [ ] Delete video
- [ ] Purchase video
- [ ] Create bundle
- [ ] Purchase bundle
- [ ] Create subscription plan
- [ ] Subscribe to creator
- [ ] View purchases

### 3. Add Payment Processing

Currently, purchases are created without actual payment processing. To add Stripe:

1. Install Stripe SDK:
```bash
cd backend
npm install stripe
```

2. Add Stripe keys to `.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

3. Update purchase endpoints to create Stripe payment intents
4. Add webhook handler for payment confirmations

### 4. Deploy to Production

1. Set up production database (AWS RDS, Supabase, etc.)
2. Deploy backend (Railway, Render, Heroku)
3. Deploy frontend (Vercel, Netlify)
4. Configure environment variables
5. Set up SSL certificates
6. Configure CORS for production domain

## 🐛 Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check database credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)
- Or kill the process using port 3000

### CORS Errors
- Update `CORS_ORIGIN` in `.env` to match your frontend URL
- Ensure backend allows your frontend origin

### Authentication Errors
- Check JWT_SECRET is set in `.env`
- Verify token is being sent in Authorization header
- Check token expiration time

## 📚 Additional Resources

- **API Documentation**: See `ARCHITECTURE.md`
- **Implementation Plan**: See `IMPLEMENTATION_PLAN.md`
- **Backend README**: See `backend/README.md`

## 🆘 Need Help?

Common issues and solutions:
1. **Module not found**: Run `npm install` in backend directory
2. **Database errors**: Check PostgreSQL is running and credentials are correct
3. **CORS errors**: Update CORS_ORIGIN in .env file
4. **Token errors**: Ensure JWT_SECRET is set in .env

## ✨ Features Ready for Production

- ✅ Secure password hashing
- ✅ JWT authentication
- ✅ Input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ Error handling
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Security headers (Helmet)

## 🔮 Future Enhancements

- [ ] Email notifications
- [ ] Creator analytics dashboard
- [ ] Search functionality
- [ ] Video categories/tags
- [ ] Comments system
- [ ] Payment receipts
- [ ] Creator verification badges
- [ ] Multi-language support

Good luck with your MyFans platform! 🚀

