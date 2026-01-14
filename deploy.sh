#!/bin/bash

# ===========================================
# CryptoPizza Deployment Script
# Domain: cryptopizza.pl
# ===========================================

set -e

DOMAIN="cryptopizza.pl"
EMAIL="admin@cryptopizza.pl"  # Change to your email for Let's Encrypt

echo "=========================================="
echo "  CryptoPizza Deployment"
echo "  Domain: $DOMAIN"
echo "=========================================="

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo ./deploy.sh"
    exit 1
fi

# Step 1: Create necessary directories
echo ""
echo "[1/7] Creating directories..."
mkdir -p certbot/www certbot/conf nginx/ssl

# Step 2: Build Docker images
echo ""
echo "[2/7] Building Docker images..."

echo "Building backend..."
cd backend
docker build -t cryptopizza-backend:latest .
cd ..

echo "Building frontend..."
cd frontend
docker build \
    --build-arg VITE_API_URL=https://$DOMAIN \
    --build-arg VITE_APP_NAME="CryptoPizza Trading" \
    -t cryptopizza-frontend:latest .
cd ..

# Step 3: Copy initial nginx config (HTTP only)
echo ""
echo "[3/7] Setting up initial Nginx config..."
cp nginx/nginx.init.conf nginx/nginx.prod.conf.bak
cp nginx/nginx.init.conf nginx/nginx.current.conf

# Create temporary nginx config for certbot
cat > nginx/nginx.current.conf << 'NGINX_CONF'
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name cryptopizza.pl www.cryptopizza.pl;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'CryptoPizza is starting...';
            add_header Content-Type text/plain;
        }
    }
}
NGINX_CONF

# Step 4: Start containers with HTTP only
echo ""
echo "[4/7] Starting services (HTTP mode)..."

# Create docker-compose override for initial setup
cat > docker-compose.init.yml << 'INIT_COMPOSE'
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: cryptopizza-db
    restart: always
    env_file: .env.production
    environment:
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - cryptopizza-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U botsfortrading_user -d botsfortrading"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    image: cryptopizza-backend:latest
    container_name: cryptopizza-api
    restart: always
    env_file: .env.production
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ASPNETCORE_URLS: http://+:5000
      ConnectionStrings__DefaultConnection: "Host=postgres;Port=5432;Database=botsfortrading;Username=botsfortrading_user;Password=${POSTGRES_PASSWORD}"
    volumes:
      - bot_data:/app/Data
      - bot_logs:/app/logs
    networks:
      - cryptopizza-network
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    image: cryptopizza-frontend:latest
    container_name: cryptopizza-web
    restart: always
    networks:
      - cryptopizza-network
    depends_on:
      - backend

  nginx:
    image: nginx:alpine
    container_name: cryptopizza-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.current.conf:/etc/nginx/nginx.conf:ro
      - ./certbot/www:/var/www/certbot:ro
      - ./certbot/conf:/etc/letsencrypt:ro
    networks:
      - cryptopizza-network
    depends_on:
      - frontend
      - backend

networks:
  cryptopizza-network:
    driver: bridge

volumes:
  postgres_data:
  bot_data:
  bot_logs:
INIT_COMPOSE

docker compose -f docker-compose.init.yml up -d

echo "Waiting for services to start..."
sleep 10

# Step 5: Get SSL certificate
echo ""
echo "[5/7] Obtaining SSL certificate from Let's Encrypt..."
docker run --rm \
    -v $(pwd)/certbot/www:/var/www/certbot \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Step 6: Switch to production nginx config with SSL
echo ""
echo "[6/7] Switching to SSL configuration..."
cp nginx/nginx.prod.conf nginx/nginx.current.conf

# Reload nginx with new config
docker exec cryptopizza-nginx nginx -s reload

# Step 7: Setup auto-renewal cron job
echo ""
echo "[7/7] Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 3 * * * cd $(pwd) && docker run --rm -v $(pwd)/certbot/www:/var/www/certbot -v $(pwd)/certbot/conf:/etc/letsencrypt certbot/certbot renew --quiet && docker exec cryptopizza-nginx nginx -s reload") | crontab -

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Your site is now available at:"
echo "  https://$DOMAIN"
echo ""
echo "Admin panel credentials:"
echo "  Email: admin@cryptopizza.pl"
echo "  Password: (see .env.production)"
echo ""
echo "Useful commands:"
echo "  View logs:    docker compose -f docker-compose.init.yml logs -f"
echo "  Stop:         docker compose -f docker-compose.init.yml down"
echo "  Restart:      docker compose -f docker-compose.init.yml restart"
echo ""
