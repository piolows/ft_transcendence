FROM node:24-alpine3.21

RUN apk add curl

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001 -G nodejs

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

EXPOSE 443

USER nodeuser

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]