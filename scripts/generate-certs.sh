#!/bin/bash
# Generate trusted localhost certificates with mkcert
# Run once: mkcert -install (installs local CA)
# Then: ./scripts/generate-certs.sh

set -e

CERTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"
mkdir -p "$CERTS_DIR"

if ! command -v mkcert &> /dev/null; then
  echo "mkcert not found. Install it:"
  echo "  macOS: brew install mkcert"
  echo "  Linux: https://github.com/FiloSottile/mkcert#installation"
  exit 1
fi

echo "Installing mkcert CA (if not already done)..."
mkcert -install 2>/dev/null || echo "  Run 'mkcert -install' manually if certs show as untrusted"

echo "Generating certificates for api.localhost, app.localhost, gd.localhost..."
mkcert -cert-file "$CERTS_DIR/localhost.crt" -key-file "$CERTS_DIR/localhost.key" \
  api.localhost app.localhost gd.localhost localhost 127.0.0.1 ::1

echo "Done. Certificates saved to $CERTS_DIR/"
echo "Restart Caddy: docker compose restart caddy"
