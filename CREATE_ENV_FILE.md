# How to Create the .env File

The lines 70-83 in SETUP_DATABASE.md are **not commands to execute** - they are **content for a file** you need to create.

## Step-by-Step Instructions

### Method 1: Using Terminal (Recommended)

Run these commands in your terminal:

```bash
cd /Users/jackxu/Documents/GitHub/myfans/backend
touch .env
```

Then open the file in your text editor and paste this content:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=jackxu
DB_PASSWORD=
DATABASE_URL=postgresql://jackxu@localhost:5432/myfans
JWT_SECRET=myfans_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
```

### Method 2: Using Your Code Editor

1. Open your code editor (VS Code, etc.)
2. Navigate to the `backend` folder
3. Create a new file named `.env` (make sure it starts with a dot!)
4. Paste the content above into the file
5. Save the file

### Method 3: Using Terminal with echo (One Command)

```bash
cd /Users/jackxu/Documents/GitHub/myfans/backend && cat > .env << 'EOF'
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myfans
DB_USER=jackxu
DB_PASSWORD=
DATABASE_URL=postgresql://jackxu@localhost:5432/myfans
JWT_SECRET=myfans_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:8080
EOF
```

## Important Notes

- **File name must be exactly `.env`** (with the dot at the beginning)
- **Location:** Must be in the `backend` folder
- **No spaces** around the `=` signs
- **DB_USER=jackxu** - I've set this to your macOS username. If you created a `postgres` user, change it to `postgres`
- **DB_PASSWORD=** - Leave empty if using your macOS username, or add your password if you created a postgres user
- **JWT_SECRET** - Change this to a random secret (in production)

## Verify the File Was Created

```bash
cd /Users/jackxu/Documents/GitHub/myfans/backend
cat .env
```

You should see all the environment variables listed.

## If You Created a PostgreSQL User with Password

If you created a `postgres` user with a password earlier, use:

```env
DB_USER=postgres
DB_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/myfans
```

## Next Steps

After creating the `.env` file:
1. Continue with Step 5: Create database tables
2. Step 6: Start backend server

