#!/bin/bash

# SNU Routine Generator Backup Script
# This script creates automated backups of the application data

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backups"
RETENTION_DAYS=7
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="snu-routine-backup-$TIMESTAMP"

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

# Create backup directory
create_backup_dir() {
    print_status "Creating backup directory..."
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
}

# Backup MongoDB
backup_mongodb() {
    print_status "Backing up MongoDB..."
    
    if docker-compose ps | grep -q "snu-mongodb"; then
        # Create MongoDB backup
        docker-compose exec -T mongodb mongodump \
            --uri="mongodb://admin:password123@localhost:27017/snu-routine-generator?authSource=admin" \
            --out="/tmp/mongodb_backup_$TIMESTAMP"
        
        # Copy backup from container
        docker cp $(docker-compose ps -q mongodb):"/tmp/mongodb_backup_$TIMESTAMP" "$BACKUP_DIR/$BACKUP_NAME/mongodb"
        
        # Clean up container backup
        docker-compose exec -T mongodb rm -rf "/tmp/mongodb_backup_$TIMESTAMP"
        
        print_status "MongoDB backup completed ✓"
    else
        print_warning "MongoDB container not found. Skipping MongoDB backup."
    fi
}

# Backup application configuration
backup_config() {
    print_status "Backing up application configuration..."
    
    # Create config backup
    mkdir -p "$BACKUP_DIR/$BACKUP_NAME/config"
    
    # Backup environment files (excluding sensitive data)
    cp backend/.env.example "$BACKUP_DIR/$BACKUP_NAME/config/backend.env.example"
    cp frontend/.env.example "$BACKUP_DIR/$BACKUP_NAME/config/frontend.env.example"
    
    # Backup Docker configuration
    cp docker-compose.yml "$BACKUP_DIR/$BACKUP_NAME/config/"
    cp backend/Dockerfile "$BACKUP_DIR/$BACKUP_NAME/config/"
    cp frontend/Dockerfile "$BACKUP_DIR/$BACKUP_NAME/config/"
    
    print_status "Configuration backup completed ✓"
}

# Backup source code (optional)
backup_source() {
    if [[ "${1:-}" == "--include-source" ]]; then
        print_status "Backing up source code..."
        
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME/source"
        
        # Backup source code (excluding node_modules and build artifacts)
        rsync -av --exclude=node_modules \
                  --exclude=.git \
                  --exclude=logs \
                  --exclude=backups \
                  --exclude=*.log \
                  --exclude=dist \
                  --exclude=build \
                  --exclude=.next \
                  . "$BACKUP_DIR/$BACKUP_NAME/source/"
        
        print_status "Source code backup completed ✓"
    fi
}

# Create backup archive
create_archive() {
    print_status "Creating backup archive..."
    
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    rm -rf "$BACKUP_NAME"
    cd ..
    
    print_status "Backup archive created: $BACKUP_DIR/$BACKUP_NAME.tar.gz ✓"
}

# Cleanup old backups
cleanup_old_backups() {
    print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    
    find "$BACKUP_DIR" -name "snu-routine-backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    print_status "Old backups cleaned up ✓"
}

# Verify backup
verify_backup() {
    print_status "Verifying backup integrity..."
    
    if [ -f "$BACKUP_DIR/$BACKUP_NAME.tar.gz" ]; then
        # Check if archive is not empty
        if [ -s "$BACKUP_DIR/$BACKUP_NAME.tar.gz" ]; then
            # Test archive integrity
            if tar -tzf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" > /dev/null 2>&1; then
                print_status "Backup verification passed ✓"
                
                # Show backup size
                BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_NAME.tar.gz" | cut -f1)
                print_status "Backup size: $BACKUP_SIZE"
            else
                print_error "Backup archive is corrupted"
                exit 1
            fi
        else
            print_error "Backup archive is empty"
            exit 1
        fi
    else
        print_error "Backup archive not found"
        exit 1
    fi
}

# List available backups
list_backups() {
    print_status "Available backups:"
    echo ""
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        print_warning "No backup directory found"
    fi
}

# Restore backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        print_error "Please specify backup file to restore"
        echo "Usage: $0 restore <backup-file>"
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    print_status "Restoring from backup: $backup_file"
    
    # Extract backup
    TEMP_DIR="/tmp/restore_$(date +%s)"
    mkdir -p "$TEMP_DIR"
    tar -xzf "$backup_file" -C "$TEMP_DIR"
    
    # Restore MongoDB
    if [ -d "$TEMP_DIR"/*/mongodb ]; then
        print_status "Restoring MongoDB..."
        docker cp "$TEMP_DIR"/*/mongodb $(docker-compose ps -q mongodb):/tmp/restore
        docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:password123@localhost:27017/snu-routine-generator?authSource=admin" --drop /tmp/restore
        docker-compose exec -T mongodb rm -rf /tmp/restore
        print_status "MongoDB restore completed ✓"
    fi
    
    # Cleanup
    rm -rf "$TEMP_DIR"
    
    print_status "Backup restore completed ✓"
}

# Main backup function
main() {
    echo "========================================"
    echo "  SNU Routine Generator Backup"
    echo "========================================"
    echo ""
    
    create_backup_dir
    backup_mongodb
    backup_config
    backup_source "$@"
    create_archive
    cleanup_old_backups
    verify_backup
    
    print_status "🎉 Backup completed successfully!"
    print_status "Backup file: $BACKUP_DIR/$BACKUP_NAME.tar.gz"
}

# Handle script arguments
case "${1:-}" in
    "list")
        list_backups
        ;;
    "restore")
        restore_backup "$2"
        ;;
    "cleanup")
        cleanup_old_backups
        ;;
    "")
        main
        ;;
    "--include-source")
        main --include-source
        ;;
    *)
        echo "Usage: $0 [list|restore <backup-file>|cleanup|--include-source]"
        echo ""
        echo "Commands:"
        echo "  list              - List available backups"
        echo "  restore <file>    - Restore from backup file"
        echo "  cleanup           - Clean up old backups"
        echo "  --include-source  - Include source code in backup"
        echo "  (no args)         - Create backup (data only)"
        exit 1
        ;;
esac
