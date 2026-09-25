#!/bin/bash

# SNU Routine Generator Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting SNU Routine Generator Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Prerequisites check passed ✓"
}

# Create necessary directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p logs
    mkdir -p backups
    mkdir -p scripts
    
    print_status "Directories created ✓"
}

# Backup existing data
backup_data() {
    print_status "Backing up existing data..."
    
    if docker-compose ps | grep -q "snu-mongodb"; then
        BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup MongoDB
        docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password123@localhost:27017/snu-routine-generator?authSource=admin" --out="/tmp/backup"
        docker cp $(docker-compose ps -q mongodb):/tmp/backup "$BACKUP_DIR/mongodb"
        
        print_status "Data backed up to $BACKUP_DIR ✓"
    else
        print_warning "No existing MongoDB container found. Skipping backup."
    fi
}

# Build and deploy
deploy_application() {
    print_status "Building and deploying application..."
    
    # Stop existing services
    print_status "Stopping existing services..."
    docker-compose down
    
    # Build new images
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker-compose up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    print_status "Application deployed ✓"
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
        print_status "Backend health check passed ✓"
    else
        print_error "Backend health check failed"
        return 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend health check passed ✓"
    else
        print_error "Frontend health check failed"
        return 1
    fi
    
    print_status "All health checks passed ✓"
}

# Show deployment status
show_status() {
    print_status "Deployment Status:"
    echo ""
    docker-compose ps
    echo ""
    print_status "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:4000"
    echo "  API Health: http://localhost:4000/api/health"
    echo ""
    print_status "Useful Commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop services: docker-compose down"
    echo "  Restart services: docker-compose restart"
}

# Main deployment flow
main() {
    echo "========================================"
    echo "  SNU Routine Generator Deployment"
    echo "========================================"
    echo ""
    
    check_prerequisites
    setup_directories
    backup_data
    deploy_application
    
    if health_check; then
        show_status
        print_status "🎉 Deployment completed successfully!"
    else
        print_error "❌ Deployment failed. Check logs for details."
        docker-compose logs
        exit 1
    fi
}

# Handle script arguments
case "${1:-}" in
    "backup")
        backup_data
        ;;
    "health")
        health_check
        ;;
    "status")
        show_status
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "stop")
        print_status "Stopping services..."
        docker-compose down
        ;;
    "restart")
        print_status "Restarting services..."
        docker-compose restart
        ;;
    "")
        main
        ;;
    *)
        echo "Usage: $0 [backup|health|status|logs|stop|restart]"
        echo ""
        echo "Commands:"
        echo "  backup   - Backup existing data"
        echo "  health   - Run health checks"
        echo "  status   - Show deployment status"
        echo "  logs     - Show application logs"
        echo "  stop     - Stop all services"
        echo "  restart  - Restart all services"
        echo "  (no args) - Full deployment"
        exit 1
        ;;
esac
