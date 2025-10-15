FROM node:24-alpine3.21

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

COPY ./tools/* /usr

USER nodeuser

EXPOSE 41613

ENTRYPOINT ["sh", "/usr/entry.sh"]
