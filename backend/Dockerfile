FROM php:8.2-cli

WORKDIR /app

RUN mkdir -p /usr/entry

COPY ./tools/* /usr/entry

RUN chmod +x /usr/entry/entry.sh

EXPOSE 3000

ENTRYPOINT ["sh", "/usr/entry/entry.sh"]