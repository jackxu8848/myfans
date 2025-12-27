# Testing User Creation - Step by Step

Follow these steps to create a user and verify it's stored in the database.

## Step 1: Make Sure PostgreSQL is Running

```bash
# Check if PostgreSQL is running
/opt/homebrew/opt/postgresql@15/bin/pg_ctl -D /opt/homebrew/var/postgresql@15 status

# If not running, start it:
/opt/homebrew/opt/postgresql@15/bin/pg_ctl -D /opt/homebrew/var/postgresql@15 start
```

Or if you're using brew services:
```bash
brew services start postgresql@15
```

## Step 2: Verify Database Exists

```bash
# List all databases
/opt/homebrew/opt/postgresql@15/bin/psql postgres -c "\l" | grep myfans
```

If you don't see `myfans`, create it:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql postgres -c "CREATE DATABASE myfans;"
```

## Step 3: Verify Tables Exist

```bash
# Check if tables exist
/opt/homebrew/opt/postgresql@15/bin/psql myfans -c "\dt"
```

If no tables exist, run the schema:
```bash
cd /Users/jackxu/Documents/GitHub/myfans
/opt/homebrew/opt/postgresql@15/bin/psql myfans -f database/schema.sql
```

## Step 4: Start Backend Server

Open a terminal and run:

```bash
cd /Users/jackxu/Documents/GitHub/myfans/backend
npm run dev
```

**Keep this terminal open!** You should see:
```
Connected to PostgreSQL database
Server running on port 3000
Environment: development
```

## Step 5: Update Frontend to Use API

You need to use the API version of login.js. 

### Option A: Replace login.js (Recommended)

```bash
cd /Users/jackxu/Documents/GitHub/myfans

# Backup current version
cp login.js login-localStorage-backup.js

# Use API version
cp login-api.js login.js
```

### Option B: Manually update login.js

Edit `login.js` to use the API instead of localStorage (see `login-api.js` as reference).

## Step 6: Start Frontend Server

Open a **new terminal** (keep backend running) and run:

```bash
cd /Users/jackxu/Documents/GitHub/myfans
node server.js
```

You should see:
```
🚀 MyFans Frontend Server running at:
   http://localhost:8080
```

## Step 7: Test User Registration

1. **Open browser:** http://localhost:8080/login.html
2. **Click "Register" tab**
3. **Fill in the form:**
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Confirm Password: password123
4. **Click "Create Account"**

You should see "Registration successful! Logging you in..." and redirect to the home page.

## Step 8: Verify User in Database

Open a **new terminal** and check the database:

```bash
# View all users
/opt/homebrew/opt/postgresql@15/bin/psql myfans -c "SELECT id, email, name, is_creator, created_at FROM users;"
```

You should see your newly created user!

### Detailed User Info

```bash
# View full user details
/opt/homebrew/opt/postgresql@15/bin/psql myfans -c "SELECT * FROM users;"
```

### Pretty Format

```bash
# Connect to database interactively
/opt/homebrew/opt/postgresql@15/bin/psql myfans

# Then run:
SELECT id, email, name, is_creator, created_at FROM users;

# Exit
\q
```

## Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify `.env` file has correct database credentials
- Check backend server logs for errors

### "Registration failed" in browser
- Check backend server is running on port 3000
- Check browser console (F12) for errors
- Check backend terminal for error messages

### "CORS error"
- Make sure `CORS_ORIGIN=http://localhost:8080` in `.env`
- Both servers must be running

### User not appearing in database
- Check backend terminal for errors
- Verify database connection in backend logs
- Try registering again and watch backend terminal

## Test with curl (Alternative Method)

You can also test the API directly:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"test123","name":"Test User 2"}'
```

This will return a JSON response with token and user info. Then check database:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql myfans -c "SELECT * FROM users;"
```

## Success Indicators

✅ Backend server shows "Connected to PostgreSQL database"  
✅ Registration shows success message in browser  
✅ Database query shows the new user  
✅ User's password is **hashed** (not plain text) in the database  

## Next Steps

Once user creation works:
1. Test login functionality
2. Update video creation to use API
3. Update purchase flows to use API
4. Test all features end-to-end

