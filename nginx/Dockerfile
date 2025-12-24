FROM nginx:alpine

# Copy nginx configuration
COPY app/nginx.conf /etc/nginx/nginx.conf

# Create directory for static files
RUN mkdir -p /usr/share/nginx/html

# Copy SSL certificates
RUN mkdir -p /etc/nginx/certs

# Create entrypoint directory
RUN mkdir -p /usr/entry
COPY tools/entry.sh /usr/entry/
RUN chmod +x /usr/entry/entry.sh

EXPOSE 443

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]