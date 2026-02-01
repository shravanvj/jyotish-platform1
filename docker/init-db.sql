-- Jyotish Platform Database Initialization
-- This script runs on first database creation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS astro;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS billing;
CREATE SCHEMA IF NOT EXISTS api;

-- Grant permissions
GRANT ALL ON SCHEMA astro TO jyotish;
GRANT ALL ON SCHEMA auth TO jyotish;
GRANT ALL ON SCHEMA billing TO jyotish;
GRANT ALL ON SCHEMA api TO jyotish;
