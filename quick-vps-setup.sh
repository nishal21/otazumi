#!/bin/bash

# Quick VPS Setup Script for Anime API
# Run this on your fresh VPS before running the main deployment script

set -e

echo "🚀 Quick VPS Setup for Anime API..."

# Update system
echo "📦 Updating system..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "📦 Installing essential tools..."
sudo apt install -y curl wget git htop nano ufw

# Configure firewall (basic)
echo "🔥 Setting up basic firewall..."
sudo ufw --force reset
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create a non-root user if running as root
if [[ $EUID -eq 0 ]]; then
    echo "⚠️  Running as root. Creating a deployment user..."

    # Create user
    sudo useradd -m -s /bin/bash deploy
    sudo usermod -aG sudo deploy

    # Set password
    echo "deploy:changeme123" | sudo chpasswd

    # Configure sudo without password for deploy user
    echo "deploy ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/deploy

    echo "✅ User 'deploy' created with password 'changeme123'"
    echo "🔑 Please change the password after first login:"
    echo "   ssh deploy@your-vps-ip"
    echo "   passwd"
    echo ""
    echo "Then run the deployment script as the deploy user:"
    echo "   wget https://raw.githubusercontent.com/nishal21/otazumi/master/deploy-anime-api-vps.sh"
    echo "   chmod +x deploy-anime-api-vps.sh"
    echo "   ./deploy-anime-api-vps.sh"
else
    echo "✅ Running as regular user, proceeding with deployment..."
    # Run the main deployment script
    wget https://raw.githubusercontent.com/nishal21/otazumi/master/deploy-anime-api-vps.sh
    chmod +x deploy-anime-api-vps.sh
    ./deploy-anime-api-vps.sh
fi

echo "✅ VPS setup completed!"
echo ""
if [[ $EUID -eq 0 ]]; then
    echo "🔄 Next steps:"
    echo "1. Login as deploy user: ssh deploy@your-vps-ip"
    echo "2. Change password: passwd"
    echo "3. Run deployment: ./deploy-anime-api-vps.sh"
else
    echo "🎉 Your anime API is now being deployed!"
fi