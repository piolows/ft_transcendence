FROM node:24-alpine3.21

USER root

WORKDIR /app

COPY ./entry.sh /app

RUN chmod +x ./entry.sh

ENTRYPOINT ["sh", "/app/entry.sh"]