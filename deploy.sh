#!/bin/bash

# Resume4Me Deployment Script
# This script pulls latest code from GitHub and deploys on server using PM2 and systemd

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Configuration
SERVER_IP="72.14.179.145"
SERVER_USER="root"
SERVER_PATH="/var/www/cvgenix"
DOMAIN="cvgenix.com"
GITHUB_REPO="https://github.com/BalwinderCa/cvgenixgit"
LOG_FILE="deploy.log"
MAX_RETRIES=3
HEALTH_CHECK_TIMEOUT=30

# Function to print output
print_status() {
    echo "[INFO] $1" | tee -a "$LOG_FILE"
}

print_warning() {
    echo "[WARNING] $1" | tee -a "$LOG_FILE"
}

print_error() {
    echo "[ERROR] $1" | tee -a "$LOG_FILE"
}

print_success() {
    echo "[SUCCESS] $1" | tee -a "$LOG_FILE"
}

# Function to log with timestamp
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check SSH connection
check_ssh_connection() {
    print_status "Checking SSH connection to server..."
    if ! ssh -i ~/.ssh/id_rsa_resume_builder -o ConnectTimeout=10 -o BatchMode=yes "$SERVER_USER@$SERVER_IP" "echo 'SSH connection successful'" >/dev/null 2>&1; then
        print_error "SSH connection failed. Please check your SSH configuration."
        exit 1
    fi
    print_success "SSH connection established"
}

# Function to check internet connectivity
check_internet() {
    print_status "Checking internet connectivity..."
    if ! curl -s --max-time 10 https://www.google.com >/dev/null; then
        print_error "No internet connection. Please check your network."
        exit 1
    fi
    print_success "Internet connection available"
}

# Function to validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    if [[ -z "$SERVER_IP" || -z "$SERVER_USER" || -z "$SERVER_PATH" || -z "$DOMAIN" || -z "$GITHUB_REPO" ]]; then
        print_error "Missing required configuration variables"
        exit 1
    fi
    
    if [[ ! "$SERVER_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_error "Invalid server IP address: $SERVER_IP"
        exit 1
    fi
    
    print_success "Configuration validated"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [[ ! -f "package.json" ]]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Check required commands
    local required_commands=("ssh" "curl" "git")
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            print_error "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    print_success "Prerequisites check passed"
}

# Function to install PM2 if not present
install_pm2() {
    print_status "Checking PM2 installation..."
    if ! ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" "command -v pm2 >/dev/null 2>&1"; then
        print_status "Installing PM2..."
        ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" "npm install -g pm2"
        print_success "PM2 installed successfully"
    else
        print_success "PM2 is already installed"
    fi
}

# Function to create PM2 ecosystem configuration
create_pm2_config() {
    print_status "Creating PM2 ecosystem configuration..."
    ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'
        cd /var/www/resume-builder-platform
        cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'resume-builder-backend',
      script: './server/index.js',
      cwd: '/var/www/resume-builder-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
PM2_EOF
        echo "PM2 ecosystem configuration created"
EOF
    print_success "PM2 configuration created"
}

# Function to create systemd service for frontend
create_systemd_service() {
    print_status "Creating systemd service for frontend..."
    ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'
        cat > /etc/systemd/system/resume-frontend.service << 'SYSTEMD_EOF'
[Unit]
Description=Resume Builder Frontend (Next.js)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/resume-builder-platform/frontend
ExecStart=/usr/bin/npm run start -- -p 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF
        systemctl daemon-reload
        systemctl enable resume-frontend
        echo "Systemd service created and enabled"
EOF
    print_success "Systemd service created"
}

# Function to deploy on server with retry mechanism
deploy_on_server() {
    local retry_count=0
    
    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        print_status "Attempting deployment (attempt $((retry_count + 1))/$MAX_RETRIES)..."
        
        if ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'; then
            set -e
            
            SERVER_PATH="/var/www/resume-builder-platform"
            GITHUB_REPO="https://github.com/BalwinderCa/resume-builder-platform.git"
            
            echo "Starting deployment process..."
            
            # Stop current services gracefully
            echo "Stopping current services..."
            pm2 stop all || true
            systemctl stop resume-frontend || true
            pkill -f "node index.js" || true
            pkill -f "npm.*start" || true
            
            # Wait for processes to stop
            sleep 3
            
            # Clone or pull from GitHub
            echo "Updating from GitHub..."
            if [[ -d "$SERVER_PATH/.git" ]]; then
                # Repository exists, pull latest changes
                cd "$SERVER_PATH"
                echo "Resetting any local changes..."
                git reset --hard HEAD
                git clean -fd
                echo "Pulling latest changes..."
                if ! git pull origin main; then
                    echo "Git pull failed"
                    exit 1
                fi
            else
                # Repository doesn't exist, clone fresh
                echo "Cloning from GitHub..."
                mkdir -p "$SERVER_PATH"
                cd "$SERVER_PATH"
                if ! git clone "$GITHUB_REPO" .; then
                    echo "Git clone failed"
                    exit 1
                fi
            fi
            
            # Copy environment file if it doesn't exist
            if [[ ! -f "$SERVER_PATH/.env" ]]; then
                echo "Creating .env file from template..."
                cp "$SERVER_PATH/env.example" "$SERVER_PATH/.env"
                # Update MongoDB URI to use local MongoDB
                sed -i 's|MONGODB_URI=mongodb+srv://.*|MONGODB_URI=mongodb://localhost:27017/resume4me|' "$SERVER_PATH/.env"
            fi
            
            # Install dependencies
            echo "Installing root dependencies..."
            if ! npm install; then
                echo "Root npm install failed"
                exit 1
            fi
            
            echo "Installing server dependencies..."
            cd "$SERVER_PATH/server"
            if ! npm install; then
                echo "Server npm install failed"
                exit 1
            fi
            
            echo "Installing frontend dependencies..."
            cd "$SERVER_PATH/frontend"
            if ! npm install --legacy-peer-deps; then
                echo "Frontend npm install failed"
                exit 1
            fi
            
            # Build the frontend for production
            echo "Building frontend for production..."
            if ! npm run build; then
                echo "Frontend build failed"
                exit 1
            fi
            
            # Create logs directory
            mkdir -p "$SERVER_PATH/logs"
            
            # Recreate PM2 ecosystem configuration (in case it was removed by git reset)
            echo "Recreating PM2 ecosystem configuration..."
            cat > "$SERVER_PATH/ecosystem.config.js" << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'resume-builder-backend',
      script: './server/index.js',
      cwd: '/var/www/resume-builder-platform',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
PM2_EOF
            
            # Start MongoDB if not running
            echo "Starting MongoDB..."
            systemctl start mongod || true
            systemctl enable mongod || true
            
            # Start backend with PM2
            echo "Starting backend with PM2..."
            cd "$SERVER_PATH"
            pm2 start ecosystem.config.js
            
            # Start frontend with systemd
            echo "Starting frontend with systemd..."
            systemctl start resume-frontend
            
            # Wait for services to start
            sleep 10
            
            # Check if services are running
            if ! pm2 list | grep -q "resume-builder-backend.*online"; then
                echo "Backend service failed to start"
                pm2 logs resume-builder-backend --lines 10
                exit 1
            fi
            
            if ! systemctl is-active --quiet resume-frontend; then
                echo "Frontend service failed to start"
                systemctl status resume-frontend --no-pager
                exit 1
            fi
            
            # Save PM2 configuration
            pm2 save
            
            echo "Deployment completed successfully!"
            echo "Backend: Running via PM2"
            echo "Frontend: Running via systemd"
EOF
            print_success "Server deployment completed"
            return 0
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $MAX_RETRIES ]]; then
                print_warning "Deployment failed, retrying in 10 seconds..."
                sleep 10
            else
                print_error "Deployment failed after $MAX_RETRIES attempts"
                return 1
            fi
        fi
    done
}

# Function to test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    local retry_count=0
    local health_check_success=false
    
    while [[ $retry_count -lt $HEALTH_CHECK_TIMEOUT && $health_check_success == false ]]; do
        # Test HTTPS endpoint
        if curl -s --max-time 10 "https://$DOMAIN" | grep -q "CVGenix\|Resume\|Builder"; then
            health_check_success=true
            print_success "Health check passed - Application is serving correctly"
        else
            retry_count=$((retry_count + 1))
            if [[ $retry_count -lt $HEALTH_CHECK_TIMEOUT ]]; then
                print_status "Health check failed, retrying in 2 seconds... ($retry_count/$HEALTH_CHECK_TIMEOUT)"
                sleep 2
            fi
        fi
    done
    
    if [[ $health_check_success == true ]]; then
        print_success "Deployment successful! Your site is live at https://$DOMAIN"
        return 0
    else
        print_warning "Health check failed after $HEALTH_CHECK_TIMEOUT attempts. Please check server logs."
        return 1
    fi
}

# Function to show deployment status
show_status() {
    print_status "Deployment Status:"
    ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'
        echo "=== PM2 Status ==="
        pm2 status
        echo ""
        echo "=== Systemd Service Status ==="
        systemctl status resume-frontend --no-pager
        echo ""
        echo "=== Port Status ==="
        ss -tlnp | grep -E ':(80|3000|3001)'
        echo ""
        echo "=== Recent Logs ==="
        echo "Backend logs (last 5 lines):"
        pm2 logs resume-builder-backend --lines 5 --nostream
        echo ""
        echo "Frontend logs (last 5 lines):"
        journalctl -u resume-frontend --no-pager -n 5
EOF
}

# Main deployment function
main() {
    echo "Starting Resume4Me deployment with PM2 and systemd at $(date)"
    echo "Log file: $LOG_FILE"
    
    # Initialize log file
    echo "=== Resume4Me Deployment Log (PM2 + systemd) ===" > "$LOG_FILE"
    log "Deployment started"
    
    # Run all checks and deployment steps
    validate_config
    check_prerequisites
    check_internet
    check_ssh_connection
    install_pm2
    create_pm2_config
    create_systemd_service
    
    log "Starting server deployment"
    if deploy_on_server; then
        log "Server deployment successful"
        
        if test_deployment; then
            log "Health check passed"
            print_success "Deployment completed successfully!"
            echo "Deployment completed at $(date)"
            echo "Live site: https://$DOMAIN"
            echo "Log file: $LOG_FILE"
            echo ""
            show_status
        else
            log "Health check failed"
            print_error "Deployment completed but health check failed"
            show_status
            exit 1
        fi
    else
        log "Server deployment failed"
        print_error "Deployment failed"
        exit 1
    fi
}

# Run main function
main "$@"