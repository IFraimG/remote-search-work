#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "========================================================"
echo "🚀 Deploying Frontend to Netlify"
echo "========================================================"

# 1. Build frontend
echo "📦 Building Vue 3 frontend..."
pnpm --filter ./frontend build

# 2. Check if Netlify CLI is authenticated or token provided
if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
  echo "🔑 Checking Netlify authorization..."
  # If no auth token in env, run netlify login or prompt
  if ! npx --yes netlify-cli status >/dev/null 2>&1; then
    echo "🌐 Opening Netlify login in browser..."
    npx --yes netlify-cli login
  fi
fi

# 3. Deploy
echo "🚀 Deploying ./frontend/dist to Netlify production..."
if [ -n "$NETLIFY_AUTH_TOKEN" ]; then
  npx --yes netlify-cli deploy --dir=frontend/dist --prod --auth="$NETLIFY_AUTH_TOKEN"
else
  npx --yes netlify-cli deploy --dir=frontend/dist --prod
fi

echo "========================================================"
echo "✅ Frontend deployment to Netlify complete!"
echo "========================================================"
