#!/bin/bash
# Docker build script - loads Supabase env from .env.local for frontend build args
# (NEXT_PUBLIC_API_URL is set per-service in docker-compose)
set -e

# Load Supabase vars from frontend-gd (or frontend) - both use same Supabase project
if [ -f frontend-gd/.env.local ]; then
  echo "Loading Supabase env from frontend-gd/.env.local"
  export $(grep -E '^NEXT_PUBLIC_SUPABASE_URL=|^NEXT_PUBLIC_SUPABASE_ANON_KEY=' frontend-gd/.env.local | xargs)
elif [ -f frontend/.env.local ]; then
  echo "Loading Supabase env from frontend/.env.local"
  export $(grep -E '^NEXT_PUBLIC_SUPABASE_URL=|^NEXT_PUBLIC_SUPABASE_ANON_KEY=' frontend/.env.local | xargs)
fi

docker compose up --build "$@"
