# Migrating from localStorage to Database

This guide will help you set up the backend database and update the frontend to store data in PostgreSQL instead of localStorage.

## Step 1: Install PostgreSQL

### macOS (using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE myfans;

# Exit psql
\q
```

## Step 3: Set Up Backend

```bash
cd backend
npm install
```

## Step 4: Configure Environment Variables

Create `backend/.env` file:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here
DATABASE_URL=postgresql://postgres:your_postgres_password_here@localhost:5432/myfans
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

**Important:** 
- Replace `your_postgres_password_here` with your actual PostgreSQL password
- Change `JWT_SECRET` to a random secure string (you can generate one with: `openssl rand -base64 32`)

## Step 5: Run Database Schema

```bash
# From the project root directory
psql -U postgres -d myfans -f database/schema.sql
```

You should see: `CREATE TABLE`, `CREATE INDEX`, etc. messages.

## Step 6: Start Backend Server

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

**Keep this terminal window open** - the server needs to keep running.

## Step 7: Test Backend API

Open a new terminal and test the API:

```bash
# Test registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

You should get a response with a token and user info.

## Step 8: Update Frontend to Use API

Now we need to update your frontend files to use the API instead of localStorage.

### Option A: Manual Update (Recommended for Learning)

I'll create updated versions of your frontend files that use the API.

### Option B: Use the API Service Module

The API service is already created at `frontend/src/js/api.js`. You need to include it and update your code.

## Testing

1. **Start backend:** `cd backend && npm run dev` (runs on port 3000)
2. **Start frontend:** `node server.js` (runs on port 8080)
3. **Open browser:** http://localhost:8080/login.html
4. **Register a user** - it should now save to the database!

## Verify Data is in Database

```bash
psql -U postgres -d myfans

# View users
SELECT * FROM users;

# View videos
SELECT * FROM videos;

# Exit
\q
```

