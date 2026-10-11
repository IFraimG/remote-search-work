#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "========================================================"
echo "🚀 Deploying Backend to Render.com"
echo "========================================================"

RENDER_CONFIG="$HOME/.render/cli.yaml"

if [ -f "$RENDER_CONFIG" ]; then
  WORKSPACE_NAME=$(grep "workspace_name:" "$RENDER_CONFIG" | cut -d: -f2- | xargs)
  echo "👤 Detected Render account: $WORKSPACE_NAME"
fi

echo "📋 Repository Blueprint: render.yaml"
echo "🌐 URL to launch Blueprint on Render:"
echo "👉 https://dashboard.render.com/blueprints/new"
echo ""
echo "Select repository: IFraimG/remote-search-work"
echo "Render will automatically build and deploy using render.yaml!"
echo "========================================================"
