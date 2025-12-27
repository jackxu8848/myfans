# Production Deployment Guide

## Common Issues and Fixes

### Issue: Registration/Login Not Working in Production

**Problem:** API calls are hardcoded to `localhost:3000` which doesn't exist in production.

**Solution:** Update API URLs to use the production backend URL.

### Configuration Options

#### Option 1: Auto-Detect (Recommended)

The code now auto-detects the environment:
- **Development:** Uses `http://localhost:3000/api`
- **Production:** Uses the same hostname/port as the frontend + `/api`

**However, this assumes your backend is on the same domain.** If your backend is on a different server, use Option 2.

#### Option 2: Set API URL in HTML

Add this to your HTML files (before any script tags):

```html
<script>
    // Set production API URL
    window.API_BASE_URL = 'https://your-backend-domain.com/api';
</script>
<script src="api-service.js"></script>
<script src="login.js"></script>
```

### Required Steps for Production

#### 1. Backend Deployment

Deploy your backend to a hosting service:
- **Railway:** https://railway.app
- **Render:** https://render.com
- **Heroku:** https://heroku.com
- **DigitalOcean:** https://digitalocean.com

Set environment variables:
- `DATABASE_URL` - Your production PostgreSQL connection string
- `JWT_SECRET` - A secure random string
- `CORS_ORIGIN` - Your frontend domain (e.g., `https://yourdomain.com`)
- `PORT` - Usually set automatically by hosting service
- `NODE_ENV=production`

#### 2. Frontend Deployment

Deploy frontend to:
- **Vercel:** https://vercel.com
- **Netlify:** https://netlify.com
- **GitHub Pages:** (but note: no server-side code)

#### 3. Update API URLs

**Option A: Same Domain (Backend and Frontend on same server)**
```javascript
// Auto-detects - should work automatically
```

**Option B: Different Domains (Backend and Frontend on different servers)**
Add to your HTML files:
```html
<script>
    window.API_BASE_URL = 'https://api.yourdomain.com/api';
</script>
```

#### 4. Update CORS Settings

In your backend `.env` file:
```env
CORS_ORIGIN=https://your-frontend-domain.com
```

#### 5. Database Setup

Ensure production database:
- Is accessible from your backend server
- Has all tables created (run `schema.sql`)
- Connection string is correct in environment variables

### Common Production Errors

#### "Failed to fetch" or Network Error
- **Cause:** Backend URL is wrong or backend is not accessible
- **Fix:** Check `window.API_BASE_URL` or ensure backend is deployed and running

#### "CORS error"
- **Cause:** Backend CORS settings don't allow your frontend domain
- **Fix:** Update `CORS_ORIGIN` in backend `.env` to match your frontend domain

#### "401 Unauthorized"
- **Cause:** JWT token expired or invalid
- **Fix:** User needs to login again (tokens expire after 7 days by default)

#### Registration Not Saving to Database
- **Cause:** Backend not connected to database or API calls failing
- **Fix:** 
  1. Check backend logs for errors
  2. Verify database connection string
  3. Check browser console (F12) for API errors
  4. Verify backend is running and accessible

### Testing Production Setup

1. **Check Backend Health:**
   ```bash
   curl https://your-backend-domain.com/health
   ```

2. **Test Registration:**
   ```bash
   curl -X POST https://your-backend-domain.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test"}'
   ```

3. **Check Database:**
   Connect to production database and verify:
   ```sql
   SELECT * FROM users;
   ```

### Quick Fix Script

Add this to the `<head>` of your HTML files to set the API URL:

```html
<script>
    // Production API URL - Update this to match your backend
    window.API_BASE_URL = 'https://your-backend-url.com/api';
    
    // Or use environment detection
    // const isDevelopment = window.location.hostname === 'localhost';
    // window.API_BASE_URL = isDevelopment 
    //     ? 'http://localhost:3000/api'
    //     : 'https://your-backend-url.com/api';
</script>
```

### Environment-Specific Configuration

Create a config file that detects environment:

```javascript
// config.js
const getApiUrl = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // Production - update this to your backend URL
    return 'https://api.yourdomain.com/api';
    // Or if backend is on same domain:
    // return `${window.location.origin}/api`;
};

window.API_BASE_URL = getApiUrl();
```

Then include it in HTML:
```html
<script src="config.js"></script>
<script src="api-service.js"></script>
```

### Debugging Tips

1. **Check Browser Console (F12):**
   - Look for network errors
   - Check what URL is being called
   - Look for CORS errors

2. **Check Backend Logs:**
   - Look for incoming requests
   - Check for database connection errors
   - Verify authentication middleware is working

3. **Verify Environment Variables:**
   - Backend must have correct `DATABASE_URL`
   - Backend must have correct `CORS_ORIGIN`
   - Backend must have `JWT_SECRET` set

4. **Test API Directly:**
   - Use curl or Postman to test backend endpoints
   - Verify responses are correct
   - Check if database is actually being written to

