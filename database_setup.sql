-- PostgreSQL Setup Script for TrackBudgetDb
-- Run this script as a PostgreSQL superuser (postgres)

-- Create database
CREATE DATABASE "TrackBudgetDb";

-- Create user with password
CREATE USER app_user WITH PASSWORD 'user1234';

-- Grant privileges to the user on the database
GRANT ALL PRIVILEGES ON DATABASE "TrackBudgetDb" TO app_user;

-- Connect to the database and grant schema privileges
\c "TrackBudgetDb"

-- Grant privileges on public schema
GRANT ALL ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Make app_user the owner of the database (optional but recommended)
ALTER DATABASE "TrackBudgetDb" OWNER TO app_user;