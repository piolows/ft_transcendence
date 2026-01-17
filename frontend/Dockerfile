# Build stage
FROM node:24-alpine3.21 AS builder

WORKDIR /app

COPY app/package*.json ./

COPY certs/* /etc/nginx/certs/

RUN npm ci

COPY app/ ./

RUN npm run build

# Runtime stage
FROM nginx:1.28.1-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY --from=builder /app/src/favicon.ico /usr/share/nginx/html

COPY certs/* /etc/nginx/certs/

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
