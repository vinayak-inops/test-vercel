#!/bin/bash

# INops Multizone Docker Deployment Script
# This script deploys all microservices in the INops platform

set -e

echo "🚀 Starting INops Multizone Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check if required files exist
print_status "Checking required files..."

REQUIRED_FILES=(
    "docker-compose.yml"
    "apps/main/Dockerfile"
    "apps/master/Dockerfile"
    "apps/dashboard/Dockerfile"
    "apps/work-flow/Dockerfile"
    "apps/reports/Dockerfile"
    "apps/leave/Dockerfile"
    "apps/muster/Dockerfile"
    "config/app.env"
    "secrets/nextauth_secret.txt"
    "secrets/database_url.txt"
    "secrets/api_key.txt"
    "secrets/jwt_secret.txt"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

print_success "All required files found!"

# Clean up existing containers and networks
print_status "Cleaning up existing Docker resources..."
docker-compose down --remove-orphans 2>/dev/null || true
docker network prune -f 2>/dev/null || true

# Build all services
print_status "Building all services..."
docker-compose build --no-cache

# Start all services
print_status "Starting all services..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

SERVICES=(
    "main-app:3000:api"
    "master-app:3001:master/api"
    "dashboard-app:3004:dashboard/api"
    "workflow-app:3002:workflow/api"
    "reports-app:3003:reports/api"
    "leave-app:3005:leave/api"
    "muster-app:3006:muster/api"
)

ALL_HEALTHY=true

for service in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port path <<< "$service"
    
    # Check if container is running
    if ! docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        print_error "Container $container_name is not running"
        ALL_HEALTHY=false
        continue
    fi
    
    # Check health endpoint
    if curl -f -s "http://localhost:$port/$path/health" > /dev/null 2>&1; then
        print_success "$container_name is healthy (port $port)"
    else
        print_warning "$container_name health check failed (port $port)"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = true ]; then
    print_success "All services are running!"
    echo ""
    echo "🌐 Access your applications:"
    echo "   Main App:     http://localhost:3000"
    echo "   Master App:   http://localhost:3001"
    echo "   Dashboard:    http://localhost:3004"
    echo "   Workflow:     http://localhost:3002"
    echo "   Reports:      http://localhost:3003"
    echo "   Leave:        http://localhost:3005"
    echo "   Muster:       http://localhost:3006"
    echo ""
    echo "📊 View logs: docker-compose logs -f"
    echo "🛑 Stop services: docker-compose down"
else
    print_warning "Some services may not be fully ready. Check logs with: docker-compose logs"
fi

echo ""
print_status "Deployment completed!" 