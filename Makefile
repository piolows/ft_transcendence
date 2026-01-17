all: build

build:
	@docker compose --env-file .env up --build -d || echo "Unexpected error during build process."

restart:
	@docker compose restart

clean:
	@docker compose down --volumes --remove-orphans

fclean:
	@docker compose down --rmi all --volumes --remove-orphans
	@docker volume rm $$(docker volume ls -q) 2&>/dev/null || true
	@docker system prune --all --force
	@docker volume prune -f
	@rm -rf ./frontend/app/node_modules
	@rm -rf ./backend/cdn/app/node_modules
	@rm -rf ./backend/auth/app/node_modules
	@rm -rf ./backend/games/app/node_modules
	@rm -rf ./backend/users/app/node_modules
	@rm -rf ./backend/controller/app/node_modules

re: fclean all

.PHONY: all build clean fclean re
