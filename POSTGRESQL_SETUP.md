# PostgreSQL Setup Guide

## 🚨 Current Issue
**Authentication failed for user `app_user`**

This means PostgreSQL is running, but the database user and/or database haven't been created yet.

## 🔧 Solution Steps

### Step 1: Install PostgreSQL (if not already installed)
1. Download PostgreSQL from https://www.postgresql.org/download/
2. Install with default settings
3. Remember the password you set for the `postgres` superuser

### Step 2: Create Database and User
1. **Open Command Prompt as Administrator**
2. **Connect to PostgreSQL as superuser:**
   ```cmd
   psql -U postgres -h localhost
   ```
   Enter the postgres password when prompted.

3. **Run the setup commands:**
   ```sql
   -- Create database
   CREATE DATABASE "TrackBudgetDb";
   
   -- Create user with password
   CREATE USER app_user WITH PASSWORD 'user1234';
   
   -- Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE "TrackBudgetDb" TO app_user;
   
   -- Connect to the database
   \c "TrackBudgetDb"
   
   -- Grant schema privileges
   GRANT ALL ON SCHEMA public TO app_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
   
   -- Exit
   \q
   ```

### Step 3: Alternative - Use Provided SQL File
You can also run the provided SQL file:
```cmd
psql -U postgres -h localhost -f database_setup.sql
```

### Step 4: Test Connection
1. **Check database health:**
   Open browser and go to: http://localhost:3001/api/health
   
2. **Initialize database tables:**
   If health check passes, call: http://localhost:3001/api/init-db (POST request)

## 🔍 Troubleshooting

### If PostgreSQL is not running:
- **Windows:** Start PostgreSQL service from Services app
- **Command:** `net start postgresql-x64-14` (version may vary)

### If connection still fails:
1. Check PostgreSQL is listening on port 5432:
   ```cmd
   netstat -an | findstr :5432
   ```

2. Check pg_hba.conf file (usually in PostgreSQL data directory):
   Ensure there's a line like:
   ```
   host    all             all             127.0.0.1/32            md5
   ```

3. Restart PostgreSQL service after any config changes.

## 🎯 Expected Result
After successful setup, the health check endpoint should return:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-XX..."
}
```

## 📱 Application Usage
Once database is properly set up:
1. Visit http://localhost:3001
2. The application will automatically create the required tables
3. Start tracking your budget!