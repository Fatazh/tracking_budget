# NeonDB Setup Guide

## Prerequisites
1. Create a NeonDB account at https://console.neon.tech/
2. Create a new project/database

## Setup Steps

### 1. Get Your Connection String
1. Go to your NeonDB dashboard
2. Navigate to "Connection Details"
3. Copy the connection string (it should look like):
   ```
   postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Replace the `DATABASE_URL` with your actual NeonDB connection string

### 3. Initialize Database Tables
Run the database initialization endpoint to create tables:
```bash
# Start your Next.js development server
npm run dev

# Then visit or curl:
http://localhost:3000/api/init-db
```

### 4. Optional: Set up Categories
Initialize default categories:
```bash
curl http://localhost:3000/api/setup-categories
```

## Connection String Format
```
postgresql://[username]:[password]@[host]/[database]?sslmode=require
```

## Important Notes
- NeonDB requires SSL connections (`sslmode=require`)
- Connection pooling is optimized for cloud databases
- Keep your connection string secure and never commit it to version control

## Troubleshooting
- Ensure your IP is whitelisted in NeonDB (if IP restrictions are enabled)
- Verify the connection string format is correct
- Check that SSL is properly configured

## Migration from Local PostgreSQL
The application now uses NeonDB instead of local PostgreSQL. No changes to the API endpoints or application logic are required.