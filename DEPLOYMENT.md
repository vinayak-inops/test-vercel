# INops Multizone Application Deployment Guide

This guide provides step-by-step instructions for deploying the INops Multizone Application using Docker.

## Architecture Overview

The INops platform consists of multiple microservices:

- **Main App** (Port 3000): Entry point and authentication gateway
- **Master App** (Port 3001): Organization and data management
- **Dashboard App** (Port 3004): Analytics and metrics
- **Workflow App** (Port 3002): Process management
- **Reports App** (Port 3003): Report generation
- **Leave App** (Port 3005): Leave management
- **Muster App** (Port 3006): Attendance tracking

## Prerequisites

1. Docker Desktop installed and running
2. At least 8GB of RAM available for Docker
3. At least 20GB of free disk space
4. Git installed (for cloning the repository)

## System Requirements

- Windows 10/11 or Linux
- Docker Desktop version 4.0.0 or higher
- Node.js v20.x (for local development only)
- npm v11.x (for local development only)

## Quick Start (Recommended)

Use the automated deployment script:

```bash
# Make the script executable
chmod +x deploy-multizone.sh

# Run the deployment
./deploy-multizone.sh
```

## Manual Deployment Steps

### 1. Prepare Your Environment

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd inops-client-desktop

# Clean up any existing Docker resources
docker system prune -f
```

### 2. Build and Deploy All Services

```bash
# Build all applications
docker-compose build --no-cache

# Start all services
docker-compose up -d

# Check the logs
docker-compose logs -f
```

### 3. Verify Deployment

1. Check if all containers are running:
```bash
docker ps | grep inops
```

2. Check container health:
```bash
docker-compose ps
```

3. Access the applications:
- Main App: `http://localhost:3000`
- Master App: `http://localhost:3001`
- Dashboard: `http://localhost:3004`
- Workflow: `http://localhost:3002`
- Reports: `http://localhost:3003`
- Leave: `http://localhost:3005`
- Muster: `http://localhost:3006`

### 4. Common Operations

#### View Logs
```bash
# View all logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f main-app
docker-compose logs -f master-app
docker-compose logs -f dashboard-app

# View last 100 lines
docker-compose logs --tail=100 -f
```

#### Restart Services
```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart main-app
```

#### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

#### Update Services
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

## Troubleshooting

### Common Issues

#### 1. Internal Server Error in Docker

**Problem**: Application works locally but gives Internal Server Error in Docker.

**Solution**: 
- Check if all required services are running: `docker-compose ps`
- Verify network connectivity: `docker network ls`
- Check service logs: `docker-compose logs [service-name]`
- Ensure all health endpoints are accessible

#### 2. Service Not Starting

**Problem**: One or more services fail to start.

**Solution**:
1. Check the logs:
```bash
docker-compose logs [service-name]
```

2. Verify Docker resources:
```bash
docker system df
docker stats
```

3. Check container status:
```bash
docker ps -a | grep inops
```

#### 3. Network Connectivity Issues

**Problem**: Services can't communicate with each other.

**Solution**:
- Verify the `inops-network` exists: `docker network ls`
- Check if containers are on the same network: `docker inspect [container-name]`
- Restart the network: `docker network rm inops-network && docker-compose up -d`

#### 4. Memory Issues

**Problem**: Containers run out of memory.

**Solution**:
1. Check Docker Desktop settings:
   - Open Docker Desktop
   - Go to Settings > Resources
   - Ensure at least 8GB RAM is allocated to Docker

2. Adjust memory limits in docker-compose.yml if needed

#### 5. Port Conflicts

**Problem**: Port already in use.

**Solution**:
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Stop conflicting services
docker-compose down
```

#### 6. Health Check Failures

**Problem**: Health checks are failing.

**Solution**:
- Verify health endpoints exist in each app
- Check if apps are properly configured for their ports
- Increase health check timeouts if needed

### Debugging Commands

```bash
# Check all running containers
docker ps

# Check container logs
docker logs [container-name]

# Check container health
docker inspect [container-name] | grep Health

# Check network connectivity
docker exec [container-name] ping [other-container]

# Access container shell
docker exec -it [container-name] sh

# Check environment variables
docker exec [container-name] env
```

### Performance Optimization

#### Memory Management
```bash
# Monitor memory usage
docker stats

# Clean up unused resources
docker system prune -a --volumes
```

#### Resource Limits
Add resource limits to docker-compose.yml if needed:
```yaml
services:
  main-app:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
```

## Security Notes

1. All applications run in production mode
2. File uploads are stored in Docker volumes
3. Applications use non-root users inside containers
4. Health checks are enabled for monitoring
5. Resource limits prevent container abuse
6. Secrets are managed through Docker secrets

## Monitoring

Each application includes a health check endpoint:
- Main: `/main/api/health`
- Master: `/master/api/health`
- Dashboard: `/dashboard/api/health`
- Workflow: `/workflow/api/health`
- Reports: `/reports/api/health`
- Leave: `/leave/api/health`
- Muster: `/muster/api/health`

Monitor the applications using:
```bash
# Check all container health
docker-compose ps

# Monitor container resources
docker stats

# Check specific service health
curl http://localhost:3000/main/api/health
```

## Support

If you encounter any issues during deployment:
1. Check the logs using `docker-compose logs`
2. Verify Docker Desktop is running properly
3. Ensure all prerequisites are met
4. Run the troubleshooting steps above
5. Contact the development team for support

## File Structure

```
inops-client-desktop/
├── docker-compose.yml          # Main multizone compose file
├── deploy-multizone.sh         # Automated deployment script
├── apps/
│   ├── main/                   # Main application
│   ├── master/                 # Master application
│   ├── dashboard/              # Dashboard application
│   ├── work-flow/              # Workflow application
│   ├── reports/                # Reports application
│   ├── leave/                  # Leave application
│   └── muster/                 # Muster application
├── config/
│   └── app.env                 # Environment configuration
└── secrets/                    # Secret files (not in git)
    ├── nextauth_secret.txt
    ├── database_url.txt
    ├── api_key.txt
    └── jwt_secret.txt
``` 