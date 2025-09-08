#!/bin/zsh

rm -rf /Users/$USER/.docker ~/Library/Containers/com.docker.docker; open -a Docker; export PATH=$PATH:/Users/$USER/.docker

# alias startdock="rm -rf /Users/$USER/.docker ~/Library/Containers/com.docker.docker; open -a Docker; export PATH=$PATH:/Users/$USER/.docker"
# source /Users/$USER/.docker/init-zsh.sh || true # Added by Docker Desktop
