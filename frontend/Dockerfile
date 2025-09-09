FROM node:24-alpine3.21

WORKDIR /app

COPY ./ /app

RUN chmod +x ./entry.sh

EXPOSE 3000

ENTRYPOINT ["sh", "./entry.sh"]