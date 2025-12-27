# Setup PostgreSQL on macOS - Step by Step

Since you're on macOS, you need to use **Homebrew** instead of `apt-get`.

## Step 1: Install Homebrew (if not already installed)

Check if you have Homebrew:
```bash
brew --version
```

If you see "command not found", install Homebrew:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Follow the prompts. After installation, you may need to add Homebrew to your PATH:
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## Step 2: Install PostgreSQL

```bash
brew install postgresql@15
```

This will take a few minutes to download and install.

## Step 3: Start PostgreSQL Service

```bash
brew services start postgresql@15
```

You should see:
```
==> Successfully started `postgresql@15` (label: homebrew.mxcl.postgresql@15)
```

## Step 4: Verify PostgreSQL is Running

```bash
brew services list
```

You should see `postgresql@15` with status "started".

## Step 5: Create Database

```bash
# Connect to PostgreSQL (default user is your macOS username, no password needed initially)
psql postgres

# In psql, create the database:
CREATE DATABASE myfans;

# Exit psql
\q
```

**Note:** If `psql` command is not found, you may need to add it to your PATH:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Or use the full path:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql postgres
```

## Step 6: Set Up PostgreSQL User (Optional but Recommended)

By default, PostgreSQL uses your macOS username. For the `.env` file, you can either:

### Option A: Use your macOS username (easiest)
```bash
# Find your username
whoami
```

Use that username in your `.env` file and leave password blank:
```env
DB_USER=your_username
DB_PASSWORD=
```

### Option B: Create a postgres user with password
```bash
psql postgres

# In psql:
CREATE USER postgres WITH PASSWORD 'your_password';
ALTER USER postgres CREATEDB;
\q
```

Then use in `.env`:
```env
DB_USER=postgres
DB_PASSWORD=your_password
```

## Troubleshooting

### "psql: error: connection to server failed"
PostgreSQL might not be running:
```bash
brew services restart postgresql@15
```

### "command not found: psql"
Add PostgreSQL to your PATH:
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Or use the full path:
```bash
/opt/homebrew/opt/postgresql@15/bin/psql postgres
```

### "role 'postgres' does not exist"
Use your macOS username instead, or create the postgres user as shown in Option B above.

## Continue with Setup

After PostgreSQL is installed and database is created, continue with:
1. Install backend: `cd backend && npm install`
2. Create `.env` file (use your username or postgres user)
3. Run schema: `psql -U your_username -d myfans -f ../database/schema.sql`
4. Start backend: `npm run dev`

See `SETUP_DATABASE.md` for the complete guide.

