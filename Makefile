# code-training: run shortcuts.
# Override ports: `make serve PORT=9000`, `make up PORT=9090`.

PORT ?= 8000
DOCKER_PORT ?= 8080

.PHONY: help serve up down build rebuild logs

help:
	@echo "Targets:"
	@echo "  make serve     Serve locally with python3 at http://localhost:$(PORT)"
	@echo "  make up        Run with Docker Compose at http://localhost:$(DOCKER_PORT) (bind-mounted, edits live)"
	@echo "  make down      Stop the Docker container"
	@echo "  make build     Build a self-contained image from Dockerfile"
	@echo "  make rebuild   Build + run the self-contained image"
	@echo "  make logs      Tail the Docker container logs"
	@echo ""
	@echo "Override port: make serve PORT=9000 / make up PORT=9090"

serve:
	@echo "Serving at http://localhost:$(PORT) (Ctrl+C to stop)"
	python3 -m http.server $(PORT)

up:
	PORT=$(DOCKER_PORT) docker compose up -d
	@echo "Running at http://localhost:$(DOCKER_PORT)"

down:
	docker compose down

build:
	docker build -t code-training .

rebuild:
	PORT=$(DOCKER_PORT) docker compose -f docker-compose.build.yml up -d --build
	@echo "Running at http://localhost:$(DOCKER_PORT)"

logs:
	docker compose logs -f