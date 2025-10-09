all: build

build:
	docker compose --env-file .env up --build -d

restart:
	docker compose restart

clean:
	docker compose down --volumes --remove-orphans

fclean: clean
#	 rm -rf ./backend/auth/app/src/node_modules
#	 rm -rf ./backend/controller/app/src/node_modules
#	 rm -rf ./backend/games/app/src/node_modules
#	 rm -rf ./backend/users/app/src/node_modules
#	 rm -rf ./frontend/app/src/node_modules
	docker compose down --rmi all --remove-orphans
	docker volume rm $$(docker volume ls -q) || true
	docker system prune --all --force
	docker volume prune -f

re: fclean all

.PHONY: all build clean fclean re
