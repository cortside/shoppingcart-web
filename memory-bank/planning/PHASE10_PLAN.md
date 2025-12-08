# PHASE10_PLAN: Deployment & Docker Containerization

**Last Updated:** 2025-11-19  
**Status:** Planning  
**Owner:** Development Team

## Overview

Package the React application as a Docker container for production deployment. This includes creating optimized production builds, configuring nginx for serving the SPA, handling environment variables, and providing deployment documentation.

## Goals

- Create production-optimized build
- Build Docker image with nginx
- Configure nginx for SPA routing
- Handle environment variable injection at runtime
- Provide docker-compose for local multi-service setup
- Document deployment process
- Prepare for cloud deployment (Azure, AWS, etc.)

## Scope

### In Scope

- Production build configuration
- Dockerfile for React app
- nginx configuration for SPA
- Runtime environment variable handling
- docker-compose.yml for local development with all services
- Build and deployment scripts
- Deployment documentation
- Health check endpoint

### Out of Scope

- CI/CD pipeline configuration (separate activity)
- Cloud-specific deployment (AKS, ECS, etc.)
- SSL/TLS certificate management
- Database setup (backend responsibility)
- Monitoring/logging infrastructure
- Backup and disaster recovery

## Dependencies

- **Prerequisites:**
  - Phase 1-9 complete (all features implemented and tested)
- **External:** Docker installed locally for testing

## Technical Details

### Production Build

**Build Command:**

```bash
npm run build
```

**Output:** `dist/` directory containing:
- Optimized JS bundles (code-split by route)
- Minified CSS
- Static assets (images, fonts)
- `index.html` (entry point)

**Build Configuration (Vite):**

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false, // Disable sourcemaps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['tailwindcss']
        }
      }
    }
  }
});
```

### Dockerfile

**Multi-stage Dockerfile:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy nginx configuration
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy environment variable injection script
COPY deploy/docker/inject-env.sh /docker-entrypoint.d/40-inject-env.sh
RUN chmod +x /docker-entrypoint.d/40-inject-env.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# nginx runs automatically via base image entrypoint
```

**Rationale:**
- **Multi-stage:** Smaller final image (no build tools, only nginx + static files)
- **Alpine base:** Minimal image size
- **Health check:** Container orchestration can verify app is running
- **Environment injection:** Script runs at container startup to inject runtime env vars

### nginx Configuration

**File:** `deploy/docker/nginx.conf`

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # SPA routing - all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}
```

**Key Features:**
- **SPA routing:** `try_files` directive ensures all routes serve `index.html` (React Router handles routing)
- **Gzip compression:** Reduces payload size
- **Asset caching:** Static assets cached for 1 year (cache busting via Vite)
- **HTML no-cache:** index.html always fresh (to get latest bundle references)
- **Health check:** `/health` endpoint returns 200 OK
- **Security headers:** Basic security best practices

### Runtime Environment Variables

**Problem:** React apps bundle environment variables at build time, but we want runtime configuration (different API URLs per environment).

**Solution:** Inject environment variables at container startup.

**Script:** `deploy/docker/inject-env.sh`

```bash
#!/bin/sh
# Inject environment variables into JavaScript runtime config

set -e

# Environment variables to inject (with defaults)
API_CATALOG_URL="${API_CATALOG_URL:-http://localhost:5001}"
API_SHOPPINGCART_URL="${API_SHOPPINGCART_URL:-http://localhost:5000}"
IDENTITY_SERVER_URL="${IDENTITY_SERVER_URL:-http://localhost:5002}"
IDENTITY_CLIENT_ID="${IDENTITY_CLIENT_ID:-shoppingcart-web}"

# Create runtime config file
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  API_CATALOG_URL: "${API_CATALOG_URL}",
  API_SHOPPINGCART_URL: "${API_SHOPPINGCART_URL}",
  IDENTITY_SERVER_URL: "${IDENTITY_SERVER_URL}",
  IDENTITY_CLIENT_ID: "${IDENTITY_CLIENT_ID}"
};
EOF

echo "Environment variables injected into /usr/share/nginx/html/config.js"
```

**Load in app:**

Update `public/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ShoppingCart</title>
    <!-- Runtime config injected by Docker -->
    <script src="/config.js"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Access in code:**

```typescript
// src/config/index.ts
declare global {
  interface Window {
    ENV?: {
      API_CATALOG_URL: string;
      API_SHOPPINGCART_URL: string;
      IDENTITY_SERVER_URL: string;
      IDENTITY_CLIENT_ID: string;
    };
  }
}

export const config = {
  apiCatalogUrl: window.ENV?.API_CATALOG_URL || 'http://localhost:5001',
  apiShoppingCartUrl: window.ENV?.API_SHOPPINGCART_URL || 'http://localhost:5000',
  identityServerUrl: window.ENV?.IDENTITY_SERVER_URL || 'http://localhost:5002',
  identityClientId: window.ENV?.IDENTITY_CLIENT_ID || 'shoppingcart-web'
};
```

**Update httpClient:**

```typescript
// src/utils/httpClient.ts
import { config } from '../config';

const baseUrls = {
  catalog: config.apiCatalogUrl,
  shoppingCart: config.apiShoppingCartUrl
};
```

### docker-compose.yml

**For local development with all services:**

```yaml
version: '3.8'

services:
  # Frontend (this app)
  web:
    build:
      context: .
      dockerfile: deploy/docker/Dockerfile
    ports:
      - "3000:80"
    environment:
      - API_CATALOG_URL=http://localhost:5001
      - API_SHOPPINGCART_URL=http://localhost:5000
      - IDENTITY_SERVER_URL=http://localhost:5002
      - IDENTITY_CLIENT_ID=shoppingcart-web
    depends_on:
      - catalog-api
      - shoppingcart-api
      - identity-server
    networks:
      - shoppingcart-network

  # Catalog API (assumed to have its own Dockerfile)
  catalog-api:
    image: shoppingcart-catalog-api:latest
    ports:
      - "5001:5001"
    networks:
      - shoppingcart-network

  # ShoppingCart API (assumed to have its own Dockerfile)
  shoppingcart-api:
    image: shoppingcart-api:latest
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/shoppingcart
    depends_on:
      - db
    networks:
      - shoppingcart-network

  # Identity Server (assumed to have its own Dockerfile)
  identity-server:
    image: shoppingcart-identity:latest
    ports:
      - "5002:5002"
    networks:
      - shoppingcart-network

  # Database (for ShoppingCart API)
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=shoppingcart
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - shoppingcart-network

networks:
  shoppingcart-network:
    driver: bridge

volumes:
  postgres-data:
```

**Usage:**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f web

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

### Build Scripts

**Add to package.json:**

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview",
    "docker:build": "docker build -f deploy/docker/Dockerfile -t shoppingcart-web:latest .",
    "docker:run": "docker run -p 3000:80 -e API_CATALOG_URL=http://localhost:5001 -e API_SHOPPINGCART_URL=http://localhost:5000 -e IDENTITY_SERVER_URL=http://localhost:5002 shoppingcart-web:latest",
    "docker:compose": "docker-compose -f deploy/docker/docker-compose.yml up -d"
  }
}
```

### Deployment Documentation

**Create:** `deploy/README.md`

**Contents:**

```markdown
# ShoppingCart Web - Deployment Guide

## Prerequisites

- Docker 20.10+
- Docker Compose 1.29+ (for multi-service setup)

## Building Docker Image

```bash
npm run docker:build
```

This creates an image tagged `shoppingcart-web:latest`.

## Running Container Locally

### Single Container

```bash
npm run docker:run
```

Or manually:

```bash
docker run -p 3000:80 \
  -e API_CATALOG_URL=http://localhost:5001 \
  -e API_SHOPPINGCART_URL=http://localhost:5000 \
  -e IDENTITY_SERVER_URL=http://localhost:5002 \
  -e IDENTITY_CLIENT_ID=shoppingcart-web \
  shoppingcart-web:latest
```

Access the app at: http://localhost:5173

### Full Stack (docker-compose)

```bash
npm run docker:compose
```

This starts:
- Web app (port 3000)
- Catalog API (port 5001)
- ShoppingCart API (port 5000)
- Identity Server (port 5002)
- PostgreSQL database

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `API_CATALOG_URL` | Catalog API endpoint | `http://localhost:5001` |
| `API_SHOPPINGCART_URL` | ShoppingCart API endpoint | `http://localhost:5000` |
| `IDENTITY_SERVER_URL` | IdentityServer endpoint | `http://localhost:5002` |
| `IDENTITY_CLIENT_ID` | OIDC client ID | `shoppingcart-web` |

## Deploying to Cloud

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry myregistry --image shoppingcart-web:v1 .

# Deploy to ACI
az container create \
  --resource-group mygroup \
  --name shoppingcart-web \
  --image myregistry.azurecr.io/shoppingcart-web:v1 \
  --dns-name-label shoppingcart \
  --ports 80 \
  --environment-variables \
    API_CATALOG_URL=https://catalog.example.com \
    API_SHOPPINGCART_URL=https://api.example.com \
    IDENTITY_SERVER_URL=https://auth.example.com
```

### AWS ECS (Fargate)

1. Push image to ECR
2. Create ECS task definition with image and env vars
3. Create ECS service
4. Configure Application Load Balancer

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shoppingcart-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: shoppingcart-web
  template:
    metadata:
      labels:
        app: shoppingcart-web
    spec:
      containers:
      - name: web
        image: shoppingcart-web:latest
        ports:
        - containerPort: 80
        env:
        - name: API_CATALOG_URL
          value: "http://catalog-api:5001"
        - name: API_SHOPPINGCART_URL
          value: "http://shoppingcart-api:5000"
        - name: IDENTITY_SERVER_URL
          value: "http://identity-server:5002"
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: shoppingcart-web
spec:
  selector:
    app: shoppingcart-web
  ports:
  - port: 80
    targetPort: 80
  type: LoadBalancer
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker logs <container-id>
```

### Health check failing

Test manually:
```bash
curl http://localhost:5173/health
```

Should return `OK`.

### Environment variables not applied

Verify config.js was created:
```bash
docker exec <container-id> cat /usr/share/nginx/html/config.js
```

### nginx 404 errors on routes

Verify nginx config includes `try_files` directive for SPA routing.
```

## Deliverables

1. **Docker Configuration**
   - `deploy/docker/Dockerfile`
   - `deploy/docker/nginx.conf`
   - `deploy/docker/inject-env.sh`
   - `deploy/docker/docker-compose.yml`

2. **Runtime Config**
   - `src/config/index.ts` (runtime config loader)
   - Update `public/index.html` with config.js script tag

3. **Build Scripts**
   - Add docker build/run scripts to `package.json`

4. **Documentation**
   - `deploy/README.md` (deployment guide)
   - Update root `README.md` with deployment section

5. **Health Check**
   - nginx `/health` endpoint
   - Dockerfile HEALTHCHECK directive

## Acceptance Criteria

- [ ] Production build creates optimized bundles < 200KB gzipped
- [ ] Docker image builds successfully
- [ ] Docker image size < 50MB
- [ ] Container starts and serves app on port 80
- [ ] Health check endpoint returns 200 OK
- [ ] Environment variables can be injected at runtime
- [ ] SPA routing works (all routes serve index.html)
- [ ] Static assets cached with long expiration
- [ ] Gzip compression enabled
- [ ] Security headers configured
- [ ] docker-compose starts all services successfully
- [ ] Deployment documentation complete and tested
- [ ] Can deploy to at least one cloud platform (Azure/AWS/GCP)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large Docker image size | Medium | Multi-stage build, Alpine base, optimize dependencies |
| Environment variable issues | High | Test thoroughly, provide defaults, document clearly |
| nginx misconfiguration | High | Test SPA routing, use standard config patterns |
| Build failures in CI | Medium | Test build locally first, pin dependency versions |
| CORS issues in production | High | Ensure backend CORS configured for production URLs |

## References

- Technical Specification Section 12.2 (Deployment)
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices/
- nginx SPA Configuration: https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations
- Vite Production Build: https://vitejs.dev/guide/build.html

## Todo List

### Docker Setup (Tasks 1-4)

- [ ] **Task 1:** Create Dockerfile
  - Status: Not Started
  - Files: `deploy/docker/Dockerfile`
  - Content: Multi-stage build with node builder + nginx runtime
  
- [ ] **Task 2:** Create nginx configuration
  - Status: Not Started
  - Files: `deploy/docker/nginx.conf`
  - Content: SPA routing, compression, caching, security headers
  
- [ ] **Task 3:** Create environment injection script
  - Status: Not Started
  - Files: `deploy/docker/inject-env.sh`
  - Content: Runtime environment variable injection to config.js
  
- [ ] **Task 4:** Create docker-compose file
  - Status: Not Started
  - Files: `deploy/docker/docker-compose.yml`
  - Content: Multi-service setup with web, APIs, database

### Runtime Config (Tasks 5-6)

- [ ] **Task 5:** Implement runtime config loader
  - Status: Not Started
  - Files: `src/config/index.ts`
  - Content: Load config from window.ENV with fallbacks
  
- [ ] **Task 6:** Update index.html for config.js
  - Status: Not Started
  - Files: `public/index.html`
  - Action: Add script tag to load /config.js

### Integration (Tasks 7-8)

- [ ] **Task 7:** Update httpClient to use runtime config
  - Status: Not Started
  - Files: `src/utils/httpClient.ts`
  - Action: Import config instead of hardcoded URLs
  
- [ ] **Task 8:** Update oidcClient to use runtime config
  - Status: Not Started
  - Files: `src/auth/oidcClient.ts`
  - Action: Use config for authority and client ID

### Build & Scripts (Tasks 9-10)

- [ ] **Task 9:** Optimize production build
  - Status: Not Started
  - Files: `vite.config.ts`
  - Action: Configure code splitting, minification, disable sourcemaps
  
- [ ] **Task 10:** Add docker scripts to package.json
  - Status: Not Started
  - Files: `package.json`
  - Action: Add docker:build, docker:run, docker:compose scripts

### Documentation (Task 11)

- [ ] **Task 11:** Create deployment documentation
  - Status: Not Started
  - Files: `deploy/README.md`, update root `README.md`
  - Content: Build instructions, run instructions, cloud deployment examples

### Testing (Tasks 12-13)

- [ ] **Task 12:** Test Docker build and run locally
  - Status: Not Started
  - Action: Build image, run container, verify app works
  - Dependencies: Tasks 1-10
  
- [ ] **Task 13:** Test docker-compose full stack
  - Status: Not Started
  - Action: Start all services, verify end-to-end functionality
  - Dependencies: Task 4
  - Notes: Requires backend service Docker images

### Cloud Deployment (Task 14)

- [ ] **Task 14:** Deploy to cloud platform (optional verification)
  - Status: Not Started
  - Action: Deploy to Azure/AWS/GCP to verify production-readiness
  - Dependencies: All previous tasks
  - Notes: May require cloud account setup

## Notes

- Docker image should be built in CI/CD pipeline, not manually
- Environment variables should be managed via secrets management in production
- Consider CDN for static assets in production (CloudFront, Azure CDN)
- Health check endpoint is critical for container orchestration
- nginx logs can be streamed to centralized logging (CloudWatch, Azure Monitor)
- Consider adding OpenTelemetry for observability in future
- Multi-stage build reduces image size significantly (no build tools in final image)
- Runtime config pattern allows same image to run in any environment
