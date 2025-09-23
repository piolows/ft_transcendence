FROM node:24-alpine3.21

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

USER nodeuser

EXPOSE 4116

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]