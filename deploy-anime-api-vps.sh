#!/bin/bash

# Anime API VPS Deployment Script
# This script sets up the anime API on a VPS with proper production configuration
# Updated: October 24, 2025

set -e

echo "🚀 Starting Anime API VPS Deployment..."

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
   echo "❌ This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y curl wget gnupg2 software-properties-common ufw

# Install Node.js 18+ and npm
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node --version)"
echo "✅ NPM version: $(npm --version)"

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "🌐 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "🔒 Installing Certbot for SSL certificates..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/anime-api
sudo chown -R $USER:$USER /var/www/anime-api

# Clone the repository
echo "📥 Cloning anime API repository..."
cd /var/www/anime-api
if [ -d ".git" ]; then
    echo "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/itzzzme/anime-api.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# Server Configuration
PORT=4444
NODE_ENV=production

# CORS Configuration (replace with your domain)
# Add your actual domain here
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,http://localhost:3000,http://localhost:5173

# Optional: Add any other environment variables as needed
# RATE_LIMIT_WINDOW_MS=900000
# RATE_LIMIT_MAX_REQUESTS=100
EOF

echo "🔧 Please edit the .env file with your actual domain:"
echo "   nano /var/www/anime-api/.env"

# Create PM2 ecosystem file
echo "📄 Creating PM2 ecosystem configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'anime-api',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4444
    },
    error_file: '/var/log/pm2/anime-api-error.log',
    out_file: '/var/log/pm2/anime-api-out.log',
    log_file: '/var/log/pm2/anime-api.log',
    time: true,
    // Restart app if it crashes
    min_uptime: '10s',
    max_restarts: 5
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Create Nginx configuration
echo "🌐 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/anime-api > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:4444;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Rate limiting for API
        limit_req zone=api burst=20 nodelay;
    }

    # Health check endpoint (no rate limiting)
    location /health {
        proxy_pass http://localhost:4444;
        access_log off;
    }

    # Cache static files if any
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security: Don't serve dotfiles
    location ~ /\. {
        deny all;
    }
}

# Redirect www to non-www
server {
    listen 80;
    server_name www.your-domain.com;
    return 301 http://your-domain.com\$request_uri;
}
EOF

# Remove default nginx site and enable our site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/anime-api /etc/nginx/sites-enabled/

# Test nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw --force reset
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Start the application with PM2
echo "🚀 Starting the application..."
cd /var/www/anime-api
pm2 delete anime-api 2>/dev/null || true  # Delete if exists
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/anime-api > /dev/null <<EOF
/var/log/pm2/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create systemd service for automatic PM2 startup
echo "🔄 Setting up PM2 auto-startup..."
sudo env PATH=\$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Create a simple health check script
echo "🏥 Creating health check script..."
cat > /var/www/anime-api/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for anime API

API_URL="http://localhost:4444"
HEALTH_ENDPOINT="/health"

# Check if API is responding
if curl -f -s "$API_URL$HEALTH_ENDPOINT" > /dev/null; then
    echo "✅ API is healthy"
    exit 0
else
    echo "❌ API is not responding"
    exit 1
fi
EOF

chmod +x /var/www/anime-api/health-check.sh

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. 🔧 Edit domain configuration:"
echo "   sudo nano /etc/nginx/sites-available/anime-api"
echo "   sudo nano /var/www/anime-api/.env"
echo ""
echo "2. 🔒 Setup SSL certificate:"
echo "   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo ""
echo "3. 🌐 Point your domain to this VPS IP address"
echo ""
echo "4. 🧪 Test the deployment:"
echo "   curl http://localhost:4444/api/most-popular?page=1"
echo "   ./health-check.sh"
echo ""
echo "🔧 Useful commands:"
echo "- Check status: pm2 status"
echo "- View logs: pm2 logs anime-api"
echo "- Restart app: pm2 restart anime-api"
echo "- Reload nginx: sudo systemctl reload nginx"
echo "- Monitor: htop or pm2 monit"
echo ""
echo "📊 Monitoring:"
echo "- Logs: /var/log/pm2/"
echo "- Health check: ./health-check.sh"
echo "- PM2 monitoring: pm2 monit"
echo ""
echo "🌐 Your API will be available at: https://your-domain.com"