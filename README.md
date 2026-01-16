# Transcendence 42 Project

## Development vs Production

This project supports both development and production modes:

### Development Mode (Default)
- Uses Vite dev server with hot reload
- TypeScript type checking is lenient (errors are ignored)
- Fast development iteration

**To run in development mode:**
```bash
docker-compose up --build
```

### Production Mode
- Uses nginx to serve pre-built static files
- Optimized build with Vite
- Better performance and caching

**To run in production mode:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build
```

## Backend Services

The application uses multiple backend microservices:
- **Backend Controller** (port 4161): Main API gateway
- **Backend Auth** (internal): Authentication service
- **Backend Users** (internal): User management
- **Backend Games** (port 4116): Game WebSocket service
- **Backend CDN** (internal): Static file serving

All backend services are proxied through the frontend:
- `/api/*` → Backend Controller
- `/game/*` → Backend Games (WebSocket support)
- `/cdn/*` → Backend Controller → CDN

## TypeScript Configuration

TypeScript is configured to be lenient and not fail builds on type errors. This allows the project to build even with existing type issues. To enable strict type checking, modify `frontend/app/tsconfig.json`.