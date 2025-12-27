# Setup Database - Quick Start Guide

Follow these steps to ensure your data (users, videos, purchases) is stored in PostgreSQL database instead of localStorage.

## Prerequisites

- Node.js installed
- PostgreSQL installed

## Step 1: Install PostgreSQL (if not already installed)

### macOS (You are on macOS)
```bash
# First, install Homebrew if you don't have it:
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify it's running
brew services list
```

**Note:** If you see "command not found: brew", you need to install Homebrew first. See instructions below.

### Ubuntu/Debian (Linux only)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

```bash
# Connect to PostgreSQL (you'll be prompted for password)
psql -U postgres

# In psql, run:
CREATE DATABASE myfans;

# Exit psql
\q
```

**Note:** If you get "role postgres does not exist", try:
```bash
createuser -s postgres
```

## Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

## Step 4: Create Environment File

Create `backend/.env` file:

```bash
cd backend
touch .env
```

Edit `.env` and add:
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=postgres
DB_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/myfans
JWT_SECRET=change_this_to_a_random_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

**IMPORTANT:** 
- Replace `your_password_here` with your actual PostgreSQL password
- For `JWT_SECRET`, generate a random string:
  ```bash
  openssl rand -base64 32
  ```

## Step 5: Create Database Tables

```bash
# From project root directory
psql -U postgres -d myfans -f database/schema.sql
```

You should see messages like:
```
CREATE TABLE
CREATE INDEX
CREATE FUNCTION
CREATE TRIGGER
```

## Step 6: Start Backend Server

```bash
cd backend
npm run dev
```

**Keep this terminal open!** The server must be running.

You should see:
```
Connected to PostgreSQL database
Server running on port 3000
Environment: development
```

## Step 7: Test Backend is Working

Open a new terminal and test:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

You should get a JSON response with a token and user info.

## Step 8: Update Frontend to Use API

### Option A: Replace login.js (Recommended)

1. **Backup current file:**
   ```bash
   mv login.js login-localStorage-backup.js
   ```

2. **Use the API version:**
   ```bash
   mv login-api.js login.js
   ```

3. **Update login.html** to ensure it loads login.js:
   ```html
   <script src="login.js"></script>
   ```

### Option B: Manual Update

Update `login.js` to use the API version I created.

## Step 9: Start Frontend Server

In a **new terminal** (keep backend running):

```bash
# From project root
node server.js
```

## Step 10: Test Registration

1. Open browser: http://localhost:8080/login.html
2. Register a new account
3. Check if user was saved to database:

```bash
psql -U postgres -d myfans
SELECT * FROM users;
\q
```

You should see your new user in the database!

## Verify Data is in Database

```bash
psql -U postgres -d myfans

# View users
SELECT id, email, name, is_creator, created_at FROM users;

# View videos (after you add some)
SELECT * FROM videos;

# View purchases (after you make some)
SELECT * FROM purchases;

# Exit
\q
```

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify password in `.env` is correct
- Check database exists: `psql -U postgres -l`

### "Port 3000 already in use"
- Change `PORT=3001` in `.env`
- Or kill the process: `lsof -ti:3000 | xargs kill`

### "Module not found"
- Run `npm install` in the `backend` directory

### "CORS error"
- Make sure `CORS_ORIGIN=http://localhost:8080` in `.env`
- Both servers must be running (backend on 3000, frontend on 8080)

## What's Different Now?

✅ **Users stored in PostgreSQL** - not localStorage
✅ **Passwords hashed** - secure bcrypt encryption
✅ **Data persists** - across browser clears
✅ **Shared data** - same database for all users
✅ **Production-ready** - proper authentication

## Next Steps

After registration/login works:
1. Update `myfans.js` to fetch videos from API
2. Update `myfans admin.js` to create videos via API
3. Update purchase flows to use API

See `MIGRATE_TO_DATABASE.md` for full migration guide.

