all: build

build:
	docker-compose up --build -d

clean:
	docker-compose down --rmi all --remove-orphans

fclean: clean
	sudo rm -rf ./frontend/node_modules
	docker volume rm $(docker volume ls -q) || true
	docker system prune --all --force
	docker volume prune -f

re: fclean all

.PHONY: all build clean fclean re
