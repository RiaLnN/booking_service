#!/bin/sh

set -e

echo "Running database migrations..."
alembic revision --autogenerate -m "init table"
alembic upgrade head

echo "Starting Uvicorn server..."
exec uvicorn backend.main:app --host 0.0.0.0 --port 8000