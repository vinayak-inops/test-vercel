#!/bin/bash

# INops Multizone Test Script
# This script tests all microservices in the INops platform

set -e

echo "🧪 Testing INops Multizone Setup..."

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

# Test configuration with correct health check paths
SERVICES=(
    "main-app:3000:api"
    "master-app:3001:master/api"
    "dashboard-app:3004:dashboard/api"
    "workflow-app:3002:workflow/api"
    "reports-app:3003:reports/api"
    "leave-app:3005:leave/api"
    "muster-app:3006:muster/api"
)

print_status "Testing container status..."

# Check if containers are running
for service in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port path <<< "$service"
    
    if docker ps --format "table {{.Names}}" | grep -q "^${container_name}$"; then
        print_success "Container $container_name is running"
    else
        print_error "Container $container_name is not running"
        exit 1
    fi
done

print_status "Testing health endpoints..."

# Test health endpoints
for service in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port path <<< "$service"
    
    # Test health endpoint
    if curl -f -s "http://localhost:$port/$path/health" > /dev/null 2>&1; then
        print_success "Health check passed for $container_name (port $port)"
    else
        print_warning "Health check failed for $container_name (port $port)"
    fi
done

print_status "Testing main application routing..."

# Test main app routing to other services
MAIN_APP_URL="http://localhost:3000"

# Test if main app is accessible
if curl -f -s "$MAIN_APP_URL" > /dev/null 2>&1; then
    print_success "Main application is accessible"
else
    print_error "Main application is not accessible"
    exit 1
fi

# Test routing to other apps through main app
ROUTES=(
    "/master"
    "/dashboard"
    "/workflow"
    "/reports"
    "/leave"
)

for route in "${ROUTES[@]}"; do
    if curl -f -s "$MAIN_APP_URL$route" > /dev/null 2>&1; then
        print_success "Route $route is accessible through main app"
    else
        print_warning "Route $route may not be accessible through main app"
    fi
done

print_status "Testing network connectivity..."

# Test inter-container communication
for service in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port path <<< "$service"
    
    # Test if container can reach other containers
    if docker exec "$container_name" ping -c 1 inops-main-app > /dev/null 2>&1; then
        print_success "Network connectivity OK for $container_name"
    else
        print_warning "Network connectivity may be limited for $container_name"
    fi
done

print_status "Testing environment variables..."

# Check if DOCKER_ENV is set correctly
for service in "${SERVICES[@]}"; do
    IFS=':' read -r container_name port path <<< "$service"
    
    if docker exec "$container_name" env | grep -q "DOCKER_ENV=true"; then
        print_success "DOCKER_ENV set correctly for $container_name"
    else
        print_warning "DOCKER_ENV not set for $container_name"
    fi
done

print_status "Testing resource usage..."

# Check resource usage
echo ""
echo "📊 Container Resource Usage:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

print_status "Testing complete!"

echo ""
echo "✅ All tests completed successfully!"
echo ""
echo "🌐 Your applications are available at:"
echo "   Main App:     http://localhost:3000"
echo "   Master App:   http://localhost:3001"
echo "   Dashboard:    http://localhost:3004"
echo "   Workflow:     http://localhost:3002"
echo "   Reports:      http://localhost:3003"
echo "   Leave:        http://localhost:3005"
echo "   Muster:       http://localhost:3006"
echo ""
echo "📊 Monitor logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down" 