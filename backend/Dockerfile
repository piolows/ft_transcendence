FROM node:24-alpine3.21

WORKDIR /app

RUN apt update && apt upgrade

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]