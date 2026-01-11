all: build

build:
# 	@docker compose --env-file .env up --build -d || echo "Unexpected error during build process."
	@docker compose --env-file .env up --build -d || echo "Unexpected error during build process."

prod: fclean
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

restart:
	@docker compose restart

clean:
	@docker compose down --volumes --remove-orphans

fclean:
	@docker compose down --rmi all --volumes --remove-orphans
	@docker volume rm $$(docker volume ls -q) 2&>/dev/null || true
	@docker system prune --all --force
	@docker volume prune -f
#	 rm -rf ./backend/controller/app/src/node_modules
#	 rm -rf ./backend/games/app/src/node_modules
#	 rm -rf ./backend/users/app/src/node_modules
#	 rm -rf ./backend/auth/app/src/node_modules
#	 rm -rf ./frontend/app/src/node_modules

re: fclean all

.PHONY: all build clean fclean re
