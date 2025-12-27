# Where is MyFans Data Stored?

## Current Implementation (localStorage)

When you run the local server (`node server.js`), **all data is stored in your browser's localStorage**. This means:

- ✅ Data is **browser-specific** - different browsers have separate data
- ✅ Data is **tied to the domain** - `http://localhost:8080` stores data separately from other domains
- ✅ Data **persists** across page reloads until you clear browser data
- ❌ Data is **NOT shared** between different browsers or devices
- ❌ Data is **NOT on the server** - the server just serves files, it doesn't store data

## What's Stored in localStorage

### User Data
- **Key:** `myfans_current_user`
  - **Contains:** Currently logged-in user info (id, email, name)
  - **Cleared when:** User logs out

- **Key:** `myfans_users`
  - **Contains:** All registered users (array)
  - **Includes:** id, email, name, password (⚠️ plain text - NOT secure!)

### Video Data
- **Key:** `myfans_videos`
  - **Contains:** All videos added by creators (array)
  - **Includes:** id, youtube_video_id, youtube_url, title, thumbnail_url, price, creator_id, etc.

### Purchase Data
- **Key:** `myfans_user_{userId}_purchased`
  - **Contains:** Array of video IDs the user has purchased
  - **Example:** `myfans_user_12345_purchased` = `["video-id-1", "video-id-2"]`

### Subscription Data
- **Key:** `myfans_user_{userId}_membership`
  - **Contains:** User's active subscription info
  - **Includes:** price, purchasedAt, expiresAt

### Creator Configuration
- **Key:** `myfans_bundles`
  - **Contains:** Bundle deals configured by creators

- **Key:** `myfans_membership_price`
  - **Contains:** Monthly subscription price set by creators

## How to View localStorage Data

### Method 1: Browser Developer Tools (Recommended)

1. **Open Developer Tools:**
   - Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Safari: Enable Developer menu first, then `Cmd+Option+I`

2. **Go to Application Tab** (Chrome/Edge) or **Storage Tab** (Firefox):
   - Click on "Application" in the top menu
   - In the left sidebar, expand "Local Storage"
   - Click on `http://localhost:8080`

3. **View Data:**
   - You'll see all the keys listed
   - Click on any key to see its value
   - Values are JSON strings - you can copy and paste them into a JSON formatter

### Method 2: Console Commands

Open the browser console (F12 → Console tab) and type:

```javascript
// View all localStorage keys
Object.keys(localStorage).filter(key => key.startsWith('myfans'))

// View current user
JSON.parse(localStorage.getItem('myfans_current_user'))

// View all users
JSON.parse(localStorage.getItem('myfans_users'))

// View all videos
JSON.parse(localStorage.getItem('myfans_videos'))

// View your purchases (replace userId with your actual user ID)
const userId = JSON.parse(localStorage.getItem('myfans_current_user')).id;
JSON.parse(localStorage.getItem(`myfans_user_${userId}_purchased`))

// Clear all MyFans data
Object.keys(localStorage)
  .filter(key => key.startsWith('myfans'))
  .forEach(key => localStorage.removeItem(key))
```

### Method 3: Browser Extensions

Install a localStorage viewer extension:
- **Chrome:** "LocalStorage Manager" or "Web Developer"
- **Firefox:** "LocalStorage Manager"

## Data Structure Examples

### User Object
```json
{
  "id": "1234567890",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "plaintext_password",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Video Object
```json
{
  "id": "video-123",
  "youtube_video_id": "dQw4w9WgXcQ",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "title": "Video Title",
  "thumbnail_url": "https://i.ytimg.com/vi/.../default.jpg",
  "price": 5.99,
  "creator_id": "creator-123",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

### Purchase Array
```json
["video-123", "video-456", "video-789"]
```

## Important Notes

### ⚠️ Security Warning
- **Passwords are stored in PLAIN TEXT** - This is NOT secure!
- This is only for development/MVP purposes
- The backend implementation uses bcrypt for password hashing

### 🔄 Data Persistence
- Data persists even after closing the browser
- To clear data: Use browser's "Clear Site Data" or delete localStorage keys
- Data is tied to `http://localhost:8080` - if you change the port, data won't be accessible

### 🌐 Switching to Backend
When you migrate to the backend API:
- Data will be stored in **PostgreSQL database** on the server
- Data will be **shared** across all browsers/devices
- Passwords will be **encrypted** (hashed with bcrypt)
- More secure and production-ready

## Migrating Data to Backend (Future)

When you're ready to use the backend:

1. **Export data from localStorage:**
   ```javascript
   // Run in browser console
   const data = {
     users: JSON.parse(localStorage.getItem('myfans_users')),
     videos: JSON.parse(localStorage.getItem('myfans_videos')),
     bundles: JSON.parse(localStorage.getItem('myfans_bundles')),
     membershipPrice: localStorage.getItem('myfans_membership_price')
   };
   console.log(JSON.stringify(data, null, 2));
   ```

2. **Import into PostgreSQL database** using migration scripts (to be created)

3. **Update frontend** to use API calls instead of localStorage

