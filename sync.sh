#!/bin/bash

# Quick Sync Script for Resume4Me
# Use this for small changes and quick updates

echo "🔄 Quick sync to resume4me.com..."

SERVER_IP="72.14.179.145"
SERVER_PATH="/var/www/resume-builder"

# Build frontend
echo "Building frontend..."
cd frontend && npm run build && cd ..

# Sync frontend build
echo "Syncing frontend build..."
scp -r frontend/build/* root@$SERVER_IP:$SERVER_PATH/frontend/build/

# Sync server files (excluding node_modules)
echo "Syncing server files..."
rsync -av --exclude='node_modules' --exclude='.env' server/ root@$SERVER_IP:$SERVER_PATH/server/

# Restart server
echo "Restarting server..."
ssh root@$SERVER_IP "cd $SERVER_PATH/server && pkill -f 'node index.js' && nohup npm start > server.log 2>&1 &"

echo "✅ Quick sync completed!"
echo "🌐 Your site: https://resume4me.com"
