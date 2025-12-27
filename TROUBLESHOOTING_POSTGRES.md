# Troubleshooting PostgreSQL Bootstrap Error

If you're getting "Bootstrap failed: 5: Input/output error" when starting PostgreSQL, try these solutions:

## Solution 1: Clean and Restart (Recommended)

```bash
# Stop the service first (even if it shows errors)
brew services stop postgresql@15

# Remove any existing plist files
rm ~/Library/LaunchAgents/homebrew.mxcl.postgresql@15.plist 2>/dev/null

# Start again
brew services start postgresql@15
```

## Solution 2: Start Manually Instead

If brew services doesn't work, you can start PostgreSQL manually:

```bash
# Start PostgreSQL manually
pg_ctl -D /opt/homebrew/var/postgresql@15 start

# Or if that doesn't work, try:
/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15
```

To stop it manually later:
```bash
pg_ctl -D /opt/homebrew/var/postgresql@15 stop
```

## Solution 3: Check and Fix Permissions

```bash
# Check PostgreSQL data directory permissions
ls -la /opt/homebrew/var/postgresql@15

# If permissions look wrong, fix them:
sudo chown -R $(whoami) /opt/homebrew/var/postgresql@15
chmod 700 /opt/homebrew/var/postgresql@15
```

## Solution 4: Reinitialize Database (Last Resort)

⚠️ **WARNING:** This will delete any existing databases!

```bash
# Stop PostgreSQL if running
brew services stop postgresql@15

# Remove old data directory
rm -rf /opt/homebrew/var/postgresql@15

# Initialize new database
initdb /opt/homebrew/var/postgresql@15

# Start again
brew services start postgresql@15
```

## Solution 5: Use PostgreSQL Directly (Skip brew services)

You can run PostgreSQL manually each time you need it:

```bash
# Start PostgreSQL (run this when you need it)
/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15 > /opt/homebrew/var/log/postgresql@15.log 2>&1 &

# Check if it's running
ps aux | grep postgres

# To stop it:
pkill postgres
```

## Quick Test: Is PostgreSQL Actually Running?

Even if brew services shows an error, PostgreSQL might still be running:

```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Try to connect
psql postgres
```

If you can connect, PostgreSQL is working! You can skip the brew services issue and just run it manually when needed.

## Recommended Workflow (If brew services doesn't work)

1. **Start PostgreSQL manually when you need it:**
   ```bash
   /opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15 > /opt/homebrew/var/log/postgresql@15.log 2>&1 &
   ```

2. **Create an alias** in your `~/.zshrc` for convenience:
   ```bash
   echo 'alias pg-start="/opt/homebrew/opt/postgresql@15/bin/postgres -D /opt/homebrew/var/postgresql@15 > /opt/homebrew/var/log/postgresql@15.log 2>&1 &"' >> ~/.zshrc
   echo 'alias pg-stop="pkill postgres"' >> ~/.zshrc
   source ~/.zshrc
   ```

3. **Then just run:**
   ```bash
   pg-start  # Start PostgreSQL
   pg-stop   # Stop PostgreSQL
   ```

## Check PostgreSQL Status

```bash
# Method 1: Check brew services
brew services list

# Method 2: Check if process is running
ps aux | grep postgres

# Method 3: Try to connect
psql postgres
```

## Continue with Setup

Once PostgreSQL is running (by any method), continue with database setup:

```bash
# Create database
psql postgres -c "CREATE DATABASE myfans;"

# Or connect interactively
psql postgres
CREATE DATABASE myfans;
\q

# Run schema
psql -d myfans -f database/schema.sql
```

The bootstrap error is usually just a launchd issue - PostgreSQL itself often works fine even if brew services shows errors!

