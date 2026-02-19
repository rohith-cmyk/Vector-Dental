#!/bin/bash
# Build and run with direct ports (no Caddy) - avoids SSL cert issues
# Access: http://localhost:3000 (specialist), http://localhost:3001 (GD)
# API: http://localhost:4000

export NEXT_PUBLIC_API_URL=http://localhost:4000
exec ./scripts/docker-build.sh "$@"
