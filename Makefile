all: build

build:
	docker compose --env-file .env up --build -d

clean:
	docker compose down --volumes --remove-orphans

fclean: clean
#	 rm -rf ./backend/src/node_modules
#	 rm -rf ./frontend/src/node_modules
	docker compose down --rmi all --remove-orphans
	docker volume rm $$(docker volume ls -q) || true
	docker system prune --all --force
	docker volume prune -f

re: fclean all

.PHONY: all build clean fclean re
