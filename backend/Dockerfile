FROM node:24-alpine3.21

WORKDIR /app

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

EXPOSE 4161

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]