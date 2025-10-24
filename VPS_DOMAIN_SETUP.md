# Anime API VPS Domain Setup Guide

## Prerequisites
- Linux VPS (Ubuntu 20.04+ or Debian 11+ recommended)
- Domain name purchased from a registrar (Namecheap, GoDaddy, etc.)
- SSH access to your VPS

## Step 1: Run the Deployment Script

1. **Connect to your VPS via SSH:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Download and run the deployment script:**
   ```bash
   wget https://raw.githubusercontent.com/nishal21/otazumi/master/deploy-anime-api-vps.sh
   chmod +x deploy-anime-api-vps.sh
   ./deploy-anime-api-vps.sh
   ```

## Step 2: Domain Configuration

### Option A: Point Domain to VPS IP (A Record)

1. **Get your VPS IP address:**
   ```bash
   curl ifconfig.me
   # or
   hostname -I | awk '{print $1}'
   ```

2. **Configure DNS at your domain registrar:**

   | Type | Name | Value | TTL |
   |------|------|-------|-----|
   | A | @ | YOUR_VPS_IP | 300 |
   | A | www | YOUR_VPS_IP | 300 |

   **Example for domain `api.example.com`:**
   - Type: A, Name: api, Value: YOUR_VPS_IP
   - Type: A, Name: www.api, Value: YOUR_VPS_IP

### Option B: Use CNAME (if you have a main domain)

If you already have a website on your main domain, use CNAME:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | api | your-main-domain.com | 300 |
| CNAME | www.api | your-main-domain.com | 300 |

## Step 3: Update Configuration Files

1. **Edit the Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/anime-api
   ```

   Replace `your-domain.com` with your actual domain:
   ```nginx
   server_name api.yourdomain.com www.api.yourdomain.com;
   ```

2. **Edit the environment file:**
   ```bash
   nano /var/www/anime-api/.env
   ```

   Update the CORS origins:
   ```env
   ALLOWED_ORIGINS=https://api.yourdomain.com,https://www.api.yourdomain.com,https://your-main-site.com
   ```

3. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Step 4: SSL Certificate Setup

1. **Install SSL certificate with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com -d www.api.yourdomain.com
   ```

2. **Test SSL:**
   ```bash
   curl -I https://api.yourdomain.com/health
   ```

3. **Set up auto-renewal:**
   ```bash
   sudo crontab -e
   ```

   Add this line:
   ```
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Step 5: Testing and Verification

1. **Test the API locally:**
   ```bash
   curl http://localhost:4444/api/most-popular?page=1
   ```

2. **Test through domain:**
   ```bash
   curl https://api.yourdomain.com/api/most-popular?page=1
   ```

3. **Check PM2 status:**
   ```bash
   pm2 status
   pm2 logs anime-api --lines 20
   ```

4. **Run health check:**
   ```bash
   cd /var/www/anime-api
   ./health-check.sh
   ```

## Step 6: Update Your Frontend

Update your `.env` file in your main application:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

## Troubleshooting

### DNS Issues
- Wait 24-48 hours for DNS propagation
- Check DNS with: `nslookup api.yourdomain.com`

### SSL Issues
- Check certificate: `sudo certbot certificates`
- Renew manually: `sudo certbot renew`

### API Issues
- Check logs: `pm2 logs anime-api`
- Restart service: `pm2 restart anime-api`

### Firewall Issues
- Check UFW status: `sudo ufw status`
- Allow port 80/443: `sudo ufw allow 'Nginx Full'`

## Monitoring

### Check Service Status
```bash
# PM2 status
pm2 status

# Nginx status
sudo systemctl status nginx

# Check if API is responding
curl -f https://api.yourdomain.com/health
```

### View Logs
```bash
# PM2 logs
pm2 logs anime-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### System Resources
```bash
# Memory usage
free -h

# Disk usage
df -h

# CPU usage
top
```

## Backup Strategy

1. **Database backup (if applicable):**
   ```bash
   # Add backup script for any databases
   ```

2. **Configuration backup:**
   ```bash
   tar -czf backup-$(date +%Y%m%d).tar.gz /var/www/anime-api /etc/nginx/sites-available/anime-api
   ```

3. **PM2 dump backup:**
   ```bash
   pm2 save
   ```

## Security Best Practices

1. **Keep system updated:**
   ```bash
   sudo apt update && sudo apt upgrade
   ```

2. **Use fail2ban for SSH protection:**
   ```bash
   sudo apt install fail2ban
   ```

3. **Regular backups and monitoring**

## Performance Optimization

1. **Enable gzip compression** ✅ (already configured)
2. **Set up rate limiting** ✅ (already configured)
3. **Configure caching headers** ✅ (already configured)
4. **Monitor memory usage** with PM2

## Support

If you encounter issues:
1. Check the logs first
2. Verify DNS configuration
3. Test SSL certificates
4. Check firewall rules

Your API should now be accessible at: `https://api.yourdomain.com`