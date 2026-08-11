#!/bin/bash
set -e

POSTGRES_PASSWORD="$POSTGRES_PASSWORD"

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
  CREATE USER saans_user WITH PASSWORD 'saans_password';
  CREATE DATABASE saans_dev OWNER saans_user;

  \connect saans_dev

  GRANT USAGE ON SCHEMA public TO saans_user;
  GRANT CREATE ON SCHEMA public TO saans_user;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO saans_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO saans_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO saans_user;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO saans_user;
EOSQL

echo "✅ Database and user created successfully!"
