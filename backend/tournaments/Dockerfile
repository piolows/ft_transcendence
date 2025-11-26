FROM node:24-alpine3.21

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chown -R nodeuser:nodejs /usr/entry && \
    chown -R nodeuser:nodejs /app

RUN chmod +x /usr/entry/entry.sh

EXPOSE 41613

USER nodeuser

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]
