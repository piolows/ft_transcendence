#!/usr/bin/env sh

set -e

# Build the application
npm run build

# Copy built files to nginx html directory
cp -r dist/* /usr/share/nginx/html/

# Start nginx
exec nginx -g "daemon off;"