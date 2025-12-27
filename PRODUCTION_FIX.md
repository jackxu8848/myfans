# Production Deployment Fixes

## Issues Fixed

### 1. API URLs Hardcoded to localhost
**Problem:** All API calls were hardcoded to `http://localhost:3000/api` which doesn't work in production.

**Solution:**
- Created `config.js` that auto-detects environment
- Updated `login.js` and `api-service.js` to use `window.API_BASE_URL`
- Added `config.js` to all HTML files

**How it works:**
- Development: Uses `http://localhost:3000/api`
- Production: Uses same domain as frontend + `/api` (e.g., `https://yourdomain.com/api`)

**For custom backend URL:** Add this before other scripts in your HTML:
```html
<script>
    window.API_BASE_URL = 'https://your-backend-url.com/api';
</script>
```

### 2. Authentication Check Using Wrong Storage
**Problem:** `index.html` was checking for `myfans_current_user` in localStorage instead of checking for auth token.

**Solution:**
- Updated `index.html` to check for `myfans_auth_token`
- Updated `myfans.js` `checkAuth()` to use API instead of localStorage

### 3. Missing config.js in HTML Files
**Problem:** HTML files didn't include `config.js` to set API URLs.

**Solution:**
- Added `<script src="config.js"></script>` to:
  - `login.html`
  - `index.html`
  - `myfans admin.html`

## Files Changed

1. **config.js** - NEW - Auto-detects API URL based on environment
2. **login.js** - Updated to use `window.API_BASE_URL`
3. **api-service.js** - Updated to use `window.API_BASE_URL`
4. **index.html** - Fixed auth check, added config.js and api-service.js
5. **login.html** - Added config.js
6. **myfans admin.html** - Added config.js
7. **myfans.js** - Updated to use async API calls (partial - still needs more work)

## Next Steps for Full Production Setup

### Backend Deployment
1. Deploy backend to hosting service (Railway, Render, Heroku, etc.)
2. Set environment variables:
   - `DATABASE_URL` - Production PostgreSQL connection string
   - `JWT_SECRET` - Secure random string
   - `CORS_ORIGIN` - Your frontend domain
   - `NODE_ENV=production`

### Frontend Deployment
1. Deploy frontend files to hosting service (Vercel, Netlify, etc.)
2. If backend is on different domain, set `window.API_BASE_URL` in HTML

### Database Setup
1. Create production database
2. Run `database/schema.sql` to create tables
3. Verify database connection in backend

### Testing
1. Open browser console (F12) and check:
   - API Base URL is correct
   - Network requests are going to correct backend
   - No CORS errors
   - Registration/login works
   - Data is saved to database

## Quick Debug Checklist

If registration/login still doesn't work:

1. **Check API URL:**
   ```javascript
   console.log(window.API_BASE_URL);
   ```
   Should show your production backend URL, not localhost

2. **Check Backend:**
   - Is backend deployed and running?
   - Can you access `https://your-backend-url.com/health`?
   - Check backend logs for errors

3. **Check CORS:**
   - Backend must have `CORS_ORIGIN` set to your frontend domain
   - Check browser console for CORS errors

4. **Check Database:**
   - Is database accessible from backend?
   - Are tables created?
   - Check database connection string in backend `.env`

5. **Check Browser Console:**
   - Open F12 → Console tab
   - Look for errors when registering
   - Check Network tab to see if API calls are being made

## Common Errors

### "Failed to fetch" or Network Error
- Backend URL is wrong → Update `window.API_BASE_URL` in HTML or check `config.js`
- Backend is not running → Check backend deployment
- CORS error → Update `CORS_ORIGIN` in backend `.env`

### Registration succeeds but no data in database
- Backend not connected to database → Check `DATABASE_URL` in backend `.env`
- Database tables not created → Run `schema.sql`
- Check backend logs for database errors

### "This video is private" when adding videos
- This is a separate issue with YouTube oEmbed API
- Check video URL is public/unlisted
- Check network tab for oEmbed API response

