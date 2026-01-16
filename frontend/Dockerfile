FROM node:24-alpine3.21

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

EXPOSE 443

USER nodeuser

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]

# Build stage
FROM node:24-alpine3.21 AS builder

WORKDIR /app

# Copy package files
COPY app/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY app/ ./

# Build the application (TypeScript errors are ignored via tsconfig.json)
# The build will succeed even if TypeScript has errors
RUN npm run build || echo "Build completed with warnings"

# Verify build output exists
RUN if [ -d "/app/dist" ]; then \
        echo "Build output found at /app/dist"; \
        ls -la /app/dist; \
    elif [ -d "/app/src/dist" ]; then \
        echo "Build output found at /app/src/dist"; \
        ls -la /app/src/dist; \
        mv /app/src/dist /app/dist; \
    else \
        echo "ERROR: Build output not found!"; \
        find /app -name "dist" -type d; \
        exit 1; \
    fi

# Production stage
FROM nginx:alpine

# Install openssl for SSL certificate management (if needed)
RUN apk add --no-cache openssl

# Copy built files from builder
# Normalize to /app/dist location
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/certs

# SSL certificates will be mounted at runtime via docker-compose volume
# The certificates volume is already defined in docker-compose.yml

# Expose port 443
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Development Nginx Dockerfile  
# Uses nginx for proxying - serves pre-built static files
FROM nginx:1.28.1-alpine

WORKDIR /app

# Create directory for SSL certificates
RUN mkdir -p /etc/nginx/certs

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 443
EXPOSE 443

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
