#!/usr/bin/env bash

enter() {
	docker exec -it $1 sh
}

alias log='docker logs'
alias dps='docker ps'
alias dils='docker image ls'
alias dcls='docker container ls'
alias dnls='docker network ls'
alias dvls='docker volume ls'
alias rest='docker restart'

make
echo "Services ready!"