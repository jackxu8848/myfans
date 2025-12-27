# Quick Start - Test MyFans Locally

## Option 1: Simple Method (Current localStorage Version)

Just open `login.html` in your browser:
- Double-click the file, or
- Drag it into your browser window

**Note:** This uses the current localStorage-based code, so it works completely offline. No backend needed!

## Option 2: Using Local Server (Recommended)

### Step 1: Start the Frontend Server

From the project root directory, run:

```bash
node server.js
```

You'll see:
```
🚀 MyFans Frontend Server running at:
   http://localhost:8080
```

### Step 2: Open in Browser

Navigate to: **http://localhost:8080/login.html**

Or just: **http://localhost:8080** (it will redirect to login)

## Testing the Current Features

### As a User:
1. **Register** - Create a new account
2. **Login** - Use your credentials
3. **View Videos** - See all available videos
4. **Buy Videos** - Purchase individual videos (simulated)
5. **Buy Bundles** - Purchase video bundles
6. **Subscribe** - Subscribe to creators (simulated)

### As a Creator:
1. **Switch to Creator Mode** - Use the toggle in the header
2. **Add Videos** - Paste YouTube URLs with pricing
3. **Create Bundles** - Set up bundle deals
4. **Set Subscription Price** - Configure monthly subscriptions
5. **Manage Videos** - Edit prices or delete videos

## Current Status

✅ **Working (localStorage):**
- User registration/login
- Video management
- Purchase simulation
- Bundle system
- Subscription setup

⏳ **To Be Migrated (Backend API):**
- All data storage (currently in localStorage)
- Real authentication (currently in localStorage)
- Payment processing (currently simulated)

## Next: Connect to Backend

Once you want to use the new backend API:

1. Set up PostgreSQL database
2. Run backend server: `cd backend && npm run dev`
3. Update frontend files to use `frontend/src/js/api.js` instead of localStorage
4. Start both servers (backend on port 3000, frontend on port 8080)

See `GETTING_STARTED.md` for full backend setup instructions.

