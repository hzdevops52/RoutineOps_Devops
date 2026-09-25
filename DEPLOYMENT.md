# Deployment Guide

This guide provides comprehensive deployment instructions for the SNU Routine Generator application in various environments.

## 🚀 Quick Deployment Options

### Option 1: Docker Compose (Recommended for Production)

**Prerequisites:**
- Docker and Docker Compose installed
- 2GB+ RAM available

**Steps:**
```bash
# Clone and navigate to project
git clone <repository-url>
cd routine-generator

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB: localhost:27017

**Stop services:**
```bash
docker-compose down
```

### Option 2: Manual Deployment

**Prerequisites:**
- Node.js 18+
- MongoDB 5.0+
- PM2 (for process management)

**Steps:**
```bash
# Backend Setup
cd backend
npm ci --production
pm2 start src/server.js --name "snu-backend"

# Frontend Setup
cd ../frontend
npm ci
npm run build
pm2 start npm --name "snu-frontend" -- start
```

## ☁️ Cloud Deployment

### Vercel + Railway (Modern Stack)

#### Frontend on Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
NEXT_PUBLIC_API_BASE_URL=https://your-backend-url.railway.app/api
```

#### Backend on Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway deploy

# Set environment variables in Railway dashboard
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
FRONTEND_URL=https://your-frontend.vercel.app
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

### AWS EC2 Deployment

#### Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd snu-routine-generator

# Backend deployment
cd backend
npm ci --production
pm2 start src/server.js --name "snu-backend"

# Frontend deployment
cd ../frontend
npm ci
npm run build
pm2 start npm --name "snu-frontend" -- start

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

#### Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/snu-routine
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/snu-routine /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Google Cloud Platform

#### Using Cloud Run + Cloud SQL

1. **Setup Cloud SQL (MongoDB)**
   ```bash
   # Create MongoDB instance
   gcloud sql instances create snu-mongodb \
       --database-version=MONGO_5_0 \
       --tier=db-f1-micro \
       --region=us-central1
   ```

2. **Build and Deploy Backend**
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/PROJECT-ID/snu-backend
   
   gcloud run deploy snu-backend \
       --image gcr.io/PROJECT-ID/snu-backend \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --set-env-vars=MONGODB_URI=mongodb://...
   ```

3. **Build and Deploy Frontend**
   ```bash
   cd frontend
   gcloud builds submit --tag gcr.io/PROJECT-ID/snu-frontend
   
   gcloud run deploy snu-frontend \
       --image gcr.io/PROJECT-ID/snu-frontend \
       --platform managed \
       --region us-central1 \
       --allow-unauthenticated \
       --set-env-vars=NEXT_PUBLIC_API_BASE_URL=https://BACKEND-URL/api
   ```

## 🔧 Environment Configuration

### Production Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/snu-routine-prod?authSource=admin

# CORS
FRONTEND_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com

# Optional: Logging
LOG_LEVEL=info
```

#### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.your-domain.com/api

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🔒 Security Considerations

### Database Security
- Use strong passwords for MongoDB
- Enable authentication in production
- Use MongoDB Atlas for cloud deployments
- Regular database backups

### Application Security
- Enable HTTPS in production
- Use environment variables for secrets
- Implement rate limiting
- Add CORS restrictions
- Regular security updates

### Docker Security
```bash
# Use non-root users (already configured in Dockerfiles)
# Scan images for vulnerabilities
docker scan snu-backend:latest
docker scan snu-frontend:latest

# Use specific image versions
FROM node:18.17.0-alpine  # Instead of node:18-alpine
```

## 📊 Monitoring & Logging

### Application Monitoring
```bash
# PM2 Monitoring
pm2 monit

# View logs
pm2 logs snu-backend
pm2 logs snu-frontend

# Restart on failure
pm2 restart snu-backend
```

### Health Checks
```bash
# Backend health
curl https://api.your-domain.com/api/health

# Frontend health
curl https://your-domain.com
```

### Docker Monitoring
```bash
# Container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Resource usage
docker stats
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        uses: railway-app/railway-action@v1
        with:
          api-token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🚨 Troubleshooting

### Common Deployment Issues

1. **Port Conflicts**
   ```bash
   # Check port usage
   sudo netstat -tlnp | grep :4000
   sudo netstat -tlnp | grep :3000
   
   # Kill processes
   sudo kill -9 <PID>
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   mongo mongodb://username:password@host:port/database
   
   # Check logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   free -h
   docker stats
   
   # Increase swap space if needed
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER /path/to/project
   chmod -R 755 /path/to/project
   ```

## 📝 Backup Strategy

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://username:password@host:port/database" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/$DATE"

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

### Application Backup
```bash
# Backup source code and configurations
tar -czf snu-routine-backup-$(date +%Y%m%d).tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=logs \
    .
```

## 📞 Support

For deployment issues:
1. Check this troubleshooting guide
2. Review application logs
3. Check infrastructure health
4. Contact the development team
