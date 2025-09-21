all: build
	source scripts.sh

build:
	docker compose up --build -d

clean:
	docker compose down --rmi all --remove-orphans

fclean: clean
#	 rm -rf ./backend/src/node_modules
#	 rm -rf ./frontend/src/node_modules
	docker volume rm $$(docker volume ls -q) || true
	docker system prune --all --force
	docker volume prune -f

re: fclean all

.PHONY: all build clean fclean re
