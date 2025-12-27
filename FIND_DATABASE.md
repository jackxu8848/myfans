# Where is the MyFans Database?

## Database Location on macOS

PostgreSQL stores all databases in its **data directory**. On macOS with Homebrew, it's typically located at:

```
/opt/homebrew/var/postgresql@15/
```

The `myfans` database is stored as a subdirectory inside this data directory.

## How to Access/View the Database

### Method 1: Connect with psql

```bash
# Connect to PostgreSQL
psql postgres

# Or directly to the myfans database
psql myfans
```

Then you can run SQL commands:
```sql
-- List all databases
\l

-- Switch to myfans database
\c myfans

-- List all tables
\dt

-- View users
SELECT * FROM users;

-- View videos
SELECT * FROM videos;

-- Exit
\q
```

### Method 2: Check if Database Exists

```bash
# List all databases
psql postgres -c "\l"

# Or
psql postgres -l
```

Look for `myfans` in the list.

### Method 3: View Database Tables

```bash
# Connect and show tables
psql myfans -c "\dt"

# View all data in users table
psql myfans -c "SELECT * FROM users;"

# View all data in videos table
psql myfans -c "SELECT * FROM videos;"
```

### Method 4: Check Database Size

```bash
psql postgres -c "SELECT pg_database.datname, pg_size_pretty(pg_database_size(pg_database.datname)) AS size FROM pg_database WHERE datname = 'myfans';"
```

## Physical Location on Disk

The actual database files are stored in:

```
/opt/homebrew/var/postgresql@15/base/[database_oid]/
```

But you **should never** access these files directly. Always use PostgreSQL commands (`psql`).

## Quick Commands Reference

```bash
# Connect to myfans database
psql myfans

# View all tables
\dt

# View table structure
\d users
\d videos

# Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM videos;

# View all users
SELECT id, email, name, is_creator, created_at FROM users;

# View all videos
SELECT id, title, price, creator_id FROM videos;

# Exit psql
\q
```

## If Database Doesn't Exist Yet

If you haven't created the database yet, create it:

```bash
psql postgres -c "CREATE DATABASE myfans;"
```

Then run the schema:

```bash
cd /Users/jackxu/Documents/GitHub/myfans
psql myfans -f database/schema.sql
```

## Using a GUI Tool (Optional)

If you prefer a graphical interface:

1. **pgAdmin** - Download from https://www.pgadmin.org/
2. **Postico** (macOS) - Download from https://eggerapps.at/postico/
3. **TablePlus** (macOS) - Download from https://tableplus.com/

Connect with:
- Host: localhost
- Port: 5432
- Database: myfans
- User: jackxu (or postgres if you created that user)
- Password: (leave empty or use your password)

