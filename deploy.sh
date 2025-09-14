#!/bin/bash

# Resume4Me Deployment Script
# This script pulls latest code from GitHub and deploys on server

set -e  # Exit on any error
set -u  # Exit on undefined variables

# Configuration
SERVER_IP="72.14.179.145"
SERVER_USER="root"
SERVER_PATH="/var/www/resume-builder"
DOMAIN="cvgenix.com"
GITHUB_REPO="https://github.com/BalwinderCa/resume-builder-platform.git"
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

# Function to ensure Apache proxy modules are enabled
ensure_apache_proxy_modules() {
    print_status "Ensuring Apache proxy modules are enabled..."
    ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'
        # Enable proxy modules if not already enabled
        a2enmod proxy proxy_http 2>/dev/null || true
        
        # Check if modules are enabled
        if apache2ctl -M | grep -q proxy_module; then
            echo "Apache proxy modules are enabled"
        else
            echo "Warning: Apache proxy modules may not be properly enabled"
        fi
EOF
    print_success "Apache proxy modules check completed"
}

# Function to deploy on server with retry mechanism
deploy_on_server() {
    local retry_count=0
    
    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        print_status "Attempting deployment (attempt $((retry_count + 1))/$MAX_RETRIES)..."
        
        if ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'; then
            set -e
            
            SERVER_PATH="/var/www/resume-builder"
            GITHUB_REPO="https://github.com/BalwinderCa/resume-builder-platform.git"
            
            echo "Starting deployment process..."
            
            # Stop the current servers gracefully
            echo "Stopping current servers..."
            pkill -f "node index.js" || true
            pkill -f "serve -s build" || true
            
            # Wait for processes to stop
            sleep 3
            
            # Backup current version (preserve git repository)
            if [[ -d "$SERVER_PATH" ]]; then
                echo "Creating backup..."
                BACKUP_PATH="${SERVER_PATH}-backup-$(date +%Y%m%d-%H%M%S)"
                # Copy instead of move to preserve git repository
                cp -r "$SERVER_PATH" "$BACKUP_PATH"
                echo "Backup created: $BACKUP_PATH"
            fi
            
            # Clone or pull from GitHub
            echo "Updating from GitHub..."
            if [[ -d "$SERVER_PATH/.git" ]]; then
                # Repository exists, pull latest changes
                cd "$SERVER_PATH"
                echo "Stashing any local changes..."
                git stash
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
            
            # Verify server dependencies are installed
            echo "Verifying server dependencies..."
            sleep 2
            if ! npm list express >/dev/null 2>&1; then
                echo "Express not found in node_modules, reinstalling..."
                npm install
                sleep 2
            fi
            
            echo "Installing frontend dependencies..."
            cd "$SERVER_PATH/frontend"
            if ! npm install --legacy-peer-deps; then
                echo "Frontend npm install failed"
                exit 1
            fi
            
            # Wait for npm install to complete and verify next is available
            echo "Verifying frontend dependencies..."
            sleep 2
            if ! npm list next >/dev/null 2>&1; then
                echo "Next.js not found in node_modules, reinstalling..."
                npm install --legacy-peer-deps
                sleep 2
            fi
            
            echo "Building frontend..."
            if ! npm run build; then
                echo "Frontend build failed"
                exit 1
            fi
            
            # Start servers
            echo "Starting backend server..."
            cd "$SERVER_PATH/server"
            nohup npm start > server.log 2>&1 &
            BACKEND_PID=$!
            
            echo "Starting frontend server..."
            cd "$SERVER_PATH/frontend"
            nohup npm start > frontend.log 2>&1 &
            FRONTEND_PID=$!
            
            # Update Apache configuration to proxy to Node.js servers
            echo "Updating Apache configuration..."
            APACHE_CONF="/etc/apache2/sites-available/cvgenix.com.conf"
            if [[ -f "$APACHE_CONF" ]]; then
                # Backup current config
                cp "$APACHE_CONF" "${APACHE_CONF}.backup.$(date +%Y%m%d-%H%M%S)"
                
                # Add proxy configuration if not already present
                if ! grep -q "ProxyPass / http://localhost:3000/" "$APACHE_CONF"; then
                    # Add proxy rules after the existing ProxyPass /api line
                    sed -i '/ProxyPass \/api http:\/\/localhost:3001\/api/a\    ProxyPass / http://localhost:3000/\n    ProxyPassReverse / http://localhost:3000/' "$APACHE_CONF"
                    echo "Added frontend proxy configuration to Apache"
                else
                    echo "Frontend proxy configuration already exists"
                fi
                
                # Reload Apache to apply changes
                systemctl reload apache2
                echo "Apache configuration reloaded"
            else
                echo "Warning: Apache configuration file not found at $APACHE_CONF"
            fi
            
            # Wait a moment for servers to start
            sleep 5
            
            # Check if servers are running
            if ! ps -p $BACKEND_PID > /dev/null; then
                echo "Backend server failed to start"
                exit 1
            fi
            
            if ! ps -p $FRONTEND_PID > /dev/null; then
                echo "Frontend server failed to start"
                exit 1
            fi
            
            echo "Deployment completed successfully!"
            echo "Backend PID: $BACKEND_PID"
            echo "Frontend PID: $FRONTEND_PID"
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
        if curl -s --max-time 10 "https://$DOMAIN/api/health" | grep -q "OK"; then
            health_check_success=true
            print_success "Health check passed"
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

# Function to cleanup old backups
cleanup_backups() {
    print_status "Cleaning up old backups..."
    ssh -i ~/.ssh/id_rsa_resume_builder "$SERVER_USER@$SERVER_IP" << 'EOF'
        SERVER_PATH="/var/www/resume-builder"
        
        # Keep only the last 3 backups
        if [[ -d "$SERVER_PATH" ]]; then
            cd "$(dirname "$SERVER_PATH")"
            ls -dt "${SERVER_PATH}-backup-"* 2>/dev/null | tail -n +4 | xargs -r rm -rf
            echo "Old backups cleaned up"
        fi
EOF
    print_success "Backup cleanup completed"
}

# Main deployment function
main() {
    echo "Starting Resume4Me deployment at $(date)"
    echo "Log file: $LOG_FILE"
    
    # Initialize log file
    echo "=== Resume4Me Deployment Log ===" > "$LOG_FILE"
    log "Deployment started"
    
    # Run all checks and deployment steps
    validate_config
    check_prerequisites
    check_internet
    check_ssh_connection
    ensure_apache_proxy_modules
    
    log "Starting server deployment"
    if deploy_on_server; then
        log "Server deployment successful"
        
        if test_deployment; then
            log "Health check passed"
            cleanup_backups
            print_success "Deployment completed successfully!"
            echo "Deployment completed at $(date)"
            echo "Live site: https://$DOMAIN"
            echo "Log file: $LOG_FILE"
        else
            log "Health check failed"
            print_error "Deployment completed but health check failed"
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
