#!/bin/bash

# Resume4Me Deployment Script
# This script syncs local changes to the production server

echo "🚀 Starting deployment to resume4me.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="72.14.179.145"
SERVER_USER="root"
SERVER_PATH="/var/www/resume-builder"
DOMAIN="resume4me.com"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Step 1: Build the frontend
print_status "Building frontend..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    print_error "Frontend build failed!"
    exit 1
fi
cd ..

# Step 2: Create deployment package
print_status "Creating deployment package..."
DEPLOY_FILE="resume4me-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf $DEPLOY_FILE \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='frontend/build' \
    --exclude='*.log' \
    .

# Step 3: Upload to server
print_status "Uploading to server..."
scp $DEPLOY_FILE $SERVER_USER@$SERVER_IP:/tmp/

# Step 4: Deploy on server
print_status "Deploying on server..."
ssh $SERVER_USER@$SERVER_IP << EOF
    # Stop the current servers
    pkill -f "node index.js"
    pkill -f "serve -s build"
    
    # Backup current version
    if [ -d "$SERVER_PATH" ]; then
        mv $SERVER_PATH ${SERVER_PATH}-backup-$(date +%Y%m%d-%H%M%S)
    fi
    
    # Extract new version
    mkdir -p $SERVER_PATH
    cd $SERVER_PATH
    tar -xzf /tmp/$DEPLOY_FILE
    
    # Install dependencies
    npm install
    cd server && npm install
    cd ../frontend && npm install && npm run build
    
    # Start servers
    cd $SERVER_PATH/server
    nohup npm start > server.log 2>&1 &
    
    cd $SERVER_PATH/frontend
    nohup serve -s build -l 3000 > frontend.log 2>&1 &
    
    # Clean up
    rm /tmp/$DEPLOY_FILE
    
    echo "Deployment completed!"
EOF

# Step 5: Clean up local file
rm $DEPLOY_FILE

# Step 6: Test deployment
print_status "Testing deployment..."
sleep 5
if curl -s https://$DOMAIN/api/health | grep -q "OK"; then
    print_status "✅ Deployment successful! Your site is live at https://$DOMAIN"
else
    print_warning "⚠️  Deployment might have issues. Please check server logs."
fi

echo "🎉 Deployment process completed!"
