#!/bin/bash

# INops Multizone Debug Script
# This script helps debug issues with the multizone setup

set -e

echo "🔍 Debugging INops Multizone Setup..."

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

print_status "=== Docker Environment Check ==="

# Check Docker status
if docker info > /dev/null 2>&1; then
    print_success "Docker is running"
else
    print_error "Docker is not running"
    exit 1
fi

# Check Docker Compose version
if docker-compose --version > /dev/null 2>&1; then
    print_success "Docker Compose is available"
else
    print_error "Docker Compose is not available"
    exit 1
fi

print_status "=== Container Status Check ==="

# Check all containers
CONTAINERS=(
    "inops-main-app"
    "inops-master-app"
    "inops-dashboard-app"
    "inops-workflow-app"
    "inops-reports-app"
    "inops-leave-app"
    "inops-muster-app"
)

for container in "${CONTAINERS[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
        STATUS=$(docker inspect --format='{{.State.Status}}' "$container")
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        print_success "$container: $STATUS (health: $HEALTH)"
    else
        print_error "$container: NOT RUNNING"
    fi
done

print_status "=== Network Check ==="

# Check network
if docker network ls | grep -q "inops-network"; then
    print_success "inops-network exists"
else
    print_error "inops-network does not exist"
fi

print_status "=== Port Check ==="

# Check if ports are accessible
PORTS=(3000 3001 3002 3003 3004 3005 3006)

for port in "${PORTS[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        print_success "Port $port is in use"
    else
        print_warning "Port $port is not in use"
    fi
done

print_status "=== Health Endpoint Check ==="

# Test health endpoints
HEALTH_ENDPOINTS=(
    "http://localhost:3000/api/health"
    "http://localhost:3001/master/api/health"
    "http://localhost:3004/dashboard/api/health"
    "http://localhost:3002/workflow/api/health"
    "http://localhost:3003/reports/api/health"
    "http://localhost:3005/leave/api/health"
    "http://localhost:3006/muster/api/health"
)

for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
    if curl -f -s "$endpoint" > /dev/null 2>&1; then
        print_success "$endpoint - OK"
    else
        print_error "$endpoint - FAILED"
    fi
done

print_status "=== Log Analysis ==="

echo ""
echo "📋 Recent logs from each container:"
echo ""

for container in "${CONTAINERS[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
        echo "=== $container logs ==="
        docker logs --tail=10 "$container" 2>&1 | head -20
        echo ""
    fi
done

print_status "=== Environment Variables Check ==="

# Check environment variables in containers
for container in "${CONTAINERS[@]}"; do
    if docker ps --format "table {{.Names}}" | grep -q "^${container}$"; then
        if docker exec "$container" env | grep -q "DOCKER_ENV=true"; then
            print_success "$container: DOCKER_ENV set correctly"
        else
            print_warning "$container: DOCKER_ENV not set"
        fi
        
        if docker exec "$container" env | grep -q "NODE_ENV=production"; then
            print_success "$container: NODE_ENV set correctly"
        else
            print_warning "$container: NODE_ENV not set correctly"
        fi
    fi
done

print_status "=== Resource Usage ==="

echo ""
echo "📊 Current resource usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"

print_status "=== Recommendations ==="

echo ""
echo "🔧 If you're seeing issues, try these steps:"
echo "1. Check logs: docker-compose logs -f [service-name]"
echo "2. Restart services: docker-compose restart"
echo "3. Rebuild: docker-compose up -d --build"
echo "4. Clean up: docker-compose down && docker system prune -f"
echo "5. Check Docker Desktop resources (8GB+ RAM recommended)"
echo ""

print_status "Debug complete!" 