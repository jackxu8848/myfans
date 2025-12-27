# Production Setup - API URL Configuration

## Problem: API calls still going to localhost:3000

If you see `http://localhost:3000/api` in the network tab after deploying to production, your backend is likely on a different domain than your frontend.

## Solution: Set Backend URL Explicitly

### Option 1: Set in HTML (Recommended)

Add this script **BEFORE** `config.js` in your HTML files (`login.html`, `index.html`, `myfans admin.html`):

```html
<head>
    <!-- ... other head content ... -->
    
    <!-- SET YOUR BACKEND URL HERE -->
    <script>
        // Replace with your actual backend URL
        window.API_BASE_URL = 'https://your-backend-url.com/api';
    </script>
    
    <!-- Then load config.js -->
    <script src="config.js"></script>
</head>
```

### Option 2: Modify config.js

Edit `config.js` and uncomment/modify one of these options:

```javascript
// Option 2: Backend on different domain
window.API_BASE_URL = 'https://your-backend-url.com/api';

// OR Option 3: Backend on subdomain
window.API_BASE_URL = `https://api.${hostname}/api`;
```

## Steps to Fix

1. **Find your backend URL:**
   - If using Railway: `https://your-app.railway.app/api`
   - If using Render: `https://your-app.onrender.com/api`
   - If using Heroku: `https://your-app.herokuapp.com/api`
   - If using your own server: `https://api.yourdomain.com/api`

2. **Update HTML files:**
   - Open `login.html`
   - Add the script tag with your backend URL in the `<head>` section
   - Do the same for `index.html` and `myfans admin.html`

3. **Verify:**
   - Deploy the updated files
   - Open browser console (F12)
   - You should see: `✅ API Base URL configured: https://your-backend-url.com/api`
   - Network tab should show requests going to your backend URL

## Example: login.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MyFans - Login</title>
    <link rel="stylesheet" href="login.css">
    
    <!-- SET YOUR BACKEND URL HERE -->
    <script>
        window.API_BASE_URL = 'https://your-backend-url.com/api';
    </script>
</head>
<body>
    <!-- ... body content ... -->
    
    <script src="config.js"></script>
    <script src="login.js"></script>
</body>
</html>
```

## Debugging

1. **Check console for API URL:**
   - Open browser DevTools (F12)
   - Look for: `✅ API Base URL configured: ...`
   - Verify it's NOT `localhost:3000`

2. **Check network tab:**
   - Open Network tab in DevTools
   - Try to register
   - Check the request URL - should be your backend URL

3. **Test backend directly:**
   ```bash
   curl https://your-backend-url.com/api/auth/register \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@test.com","password":"test123"}'
   ```

## Common Issues

### Still showing localhost:3000
- **Cause:** Browser cache or files not deployed
- **Fix:** Hard refresh (Ctrl+Shift+R or Cmd+Shift+R), clear cache, or check if updated files are deployed

### CORS errors
- **Cause:** Backend not configured to allow your frontend domain
- **Fix:** Update `CORS_ORIGIN` in backend `.env` file to match your frontend domain

### 404 errors on API calls
- **Cause:** Backend URL is wrong or backend not running
- **Fix:** Verify backend is deployed and accessible, check URL is correct

